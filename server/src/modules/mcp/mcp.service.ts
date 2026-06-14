import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { SitesService } from '../sites/sites.service.js';
import { ContentTypesService } from '../content-types/content-types.service.js';
import { ContentEntriesService } from '../content-entries/content-entries.service.js';
import { MediaReferencesService } from '../media-references/media-references.service.js';
import { ThemesService } from '../themes/themes.service.js';
import { ComponentCategory } from '../themes/entities/theme-component.entity.js';
import { ContentStatus } from '../content-entries/entities/content-entry.entity.js';
import type { Site } from '../sites/entities/site.entity.js';

interface McpSession {
  server: McpServer;
  transport: SSEServerTransport;
}

type ToolResult = { content: Array<{ type: 'text'; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function err(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

@Injectable()
export class McpService implements OnApplicationShutdown {
  private readonly logger = new Logger(McpService.name);
  private readonly sessions = new Map<string, McpSession>();

  constructor(
    private readonly sitesService: SitesService,
    private readonly contentTypesService: ContentTypesService,
    private readonly contentEntriesService: ContentEntriesService,
    private readonly mediaReferencesService: MediaReferencesService,
    private readonly themesService: ThemesService,
  ) {}

  /**
   * Creates a new MCP server instance pre-configured with all capabilities.
   * Pass the authenticated site so tools can scope operations to that site by default.
   */
  createServer(site?: Site): McpServer {
    const server = new McpServer({
      name: 'omnara',
      version: '1.0.0',
    });

    this.registerCapabilities(server, site);

    return server;
  }

  private registerCapabilities(server: McpServer, _site?: Site): void {
    this.registerTools(server);
    this.registerResources(server);
    this.registerPrompts(server);
  }

  // ---------------------------------------------------------------------------
  // Tools
  // ---------------------------------------------------------------------------

  private registerTools(server: McpServer): void {
    server.registerTool(
      'list_sites',
      {
        description:
          'Lists all CMS sites managed by this omnara instance. Returns an array of site objects each containing id, name, url, platform (wordpress|shopify|custom), and settings. Call this first to discover available site IDs before performing any site-scoped operations.',
      },
      async () => {
        try {
          const sites = await this.sitesService.findAll();
          return ok(
            sites.map((s) => ({
              id: s.id,
              name: s.name,
              url: s.url,
              platform: s.platform,
              settings: s.settings,
            })),
          );
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'list_content_types',
      {
        description:
          'Lists all content types defined for a given site. Each content type defines the schema for a category of content (e.g. "blog_post", "product"). Returns id, name, slug, and fieldSchema for each type. Use the fieldSchema to understand which fields are expected when creating or updating content entries.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site whose content types to list'),
        },
      },
      async ({ site_id }) => {
        try {
          const types = await this.contentTypesService.findAll(site_id);
          return ok(
            types.map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              fieldSchema: t.fieldSchema,
            })),
          );
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'list_content_entries',
      {
        description:
          'Lists content entries for a site with optional filtering. Returns entries ordered by creation date descending. Use content_type_id to narrow to a specific type, status to filter by lifecycle state (draft|review|live|archived), and created_after/created_before (ISO 8601 date strings) for date range filters.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site to list entries for'),
          content_type_id: z.string().optional().describe('Filter by content type UUID'),
          status: z
            .enum([
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.LIVE,
              ContentStatus.ARCHIVED,
            ])
            .optional()
            .describe('Filter by entry status: draft, review, live, or archived'),
          created_after: z
            .string()
            .optional()
            .describe('ISO 8601 date string — return only entries created after this date'),
          created_before: z
            .string()
            .optional()
            .describe('ISO 8601 date string — return only entries created before this date'),
        },
      },
      async ({ site_id, content_type_id, status, created_after, created_before }) => {
        try {
          const entries = await this.contentEntriesService.findAll(site_id, {
            contentTypeId: content_type_id,
            status: status as ContentStatus | undefined,
            createdAfter: created_after,
            createdBefore: created_before,
          });
          return ok(entries);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'get_content_entry',
      {
        description:
          'Fetches a single content entry by its ID, scoped to the given site. Returns the full entry including title, slug, body (JSON object with field values), status, publishedAt, and contentType details. Use this before updating an entry to read its current state.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to fetch'),
        },
      },
      async ({ site_id, entry_id }) => {
        try {
          const entry = await this.contentEntriesService.findOne(entry_id, site_id);
          return ok(entry);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'create_content_entry',
      {
        description:
          'Creates a new content entry for a site. The body field should be a JSON object whose keys match the fieldSchema of the chosen content type. Status defaults to "draft" if not specified. Returns the newly created entry with its assigned UUID.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site to create the entry in'),
          content_type_id: z
            .string()
            .describe('The UUID of the content type this entry belongs to'),
          title: z.string().describe('Human-readable title of the entry'),
          slug: z.string().describe('URL-safe identifier for the entry (e.g. "my-blog-post")'),
          body: z
            .record(z.unknown())
            .optional()
            .describe(
              'JSON object containing the entry fields as defined by the content type fieldSchema',
            ),
          status: z
            .enum([
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.LIVE,
              ContentStatus.ARCHIVED,
            ])
            .optional()
            .describe('Initial status — defaults to draft'),
          author_session_id: z
            .string()
            .optional()
            .describe('Identifier for the agent or session that authored this entry'),
        },
      },
      async ({ site_id, content_type_id, title, slug, body, status, author_session_id }) => {
        try {
          const entry = await this.contentEntriesService.create(site_id, {
            contentTypeId: content_type_id,
            title,
            slug,
            body,
            status: status as ContentStatus | undefined,
            authorSessionId: author_session_id,
          });
          return ok(entry);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'update_content_entry',
      {
        description:
          'Updates an existing content entry. All fields except site_id and entry_id are optional — only the provided fields will be changed. To change the content type, provide content_type_id. Returns the updated entry.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to update'),
          title: z.string().optional().describe('New title'),
          slug: z.string().optional().describe('New URL-safe slug'),
          body: z
            .record(z.unknown())
            .optional()
            .describe('New body JSON — replaces the existing body entirely'),
          status: z
            .enum([
              ContentStatus.DRAFT,
              ContentStatus.REVIEW,
              ContentStatus.LIVE,
              ContentStatus.ARCHIVED,
            ])
            .optional()
            .describe('New status'),
          content_type_id: z
            .string()
            .optional()
            .describe('Reassign to a different content type UUID'),
          author_session_id: z
            .string()
            .optional()
            .describe('Update the authoring session identifier'),
        },
      },
      async ({
        site_id,
        entry_id,
        title,
        slug,
        body,
        status,
        content_type_id,
        author_session_id,
      }) => {
        try {
          const entry = await this.contentEntriesService.update(entry_id, site_id, {
            title,
            slug,
            body,
            status: status as ContentStatus | undefined,
            contentTypeId: content_type_id,
            authorSessionId: author_session_id,
          });
          return ok(entry);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'delete_content_entry',
      {
        description:
          'Permanently deletes a content entry. This action is irreversible. Returns an empty success response on deletion.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to delete'),
        },
      },
      async ({ site_id, entry_id }) => {
        try {
          await this.contentEntriesService.remove(entry_id, site_id);
          return ok({ deleted: true });
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'publish_content_entry',
      {
        description:
          'Publishes a content entry by setting its status to "live" and recording a publishedAt timestamp. The entry must exist and belong to the given site. Returns the updated entry.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to publish'),
        },
      },
      async ({ site_id, entry_id }) => {
        try {
          const entry = await this.contentEntriesService.publish(entry_id, site_id);
          return ok(entry);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'unpublish_content_entry',
      {
        description:
          'Unpublishes a content entry by reverting its status to "draft" and clearing publishedAt. Use this to take content offline without deleting it. Returns the updated entry.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to unpublish'),
        },
      },
      async ({ site_id, entry_id }) => {
        try {
          const entry = await this.contentEntriesService.unpublish(entry_id, site_id);
          return ok(entry);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'attach_media',
      {
        description:
          'Attaches a media reference (image, video, document, etc.) to a content entry. Provide the publicly accessible URL of the media asset, its MIME type (e.g. "image/jpeg", "video/mp4"), and an optional alt text for accessibility. Returns the created media reference with its UUID.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry to attach media to'),
          url: z.string().describe('Publicly accessible URL of the media asset'),
          mime_type: z
            .string()
            .describe('MIME type of the asset (e.g. "image/jpeg", "application/pdf")'),
          alt_text: z
            .string()
            .optional()
            .describe('Accessible description of the media, used for screen readers and SEO'),
        },
      },
      async ({ site_id, entry_id, url, mime_type, alt_text }) => {
        try {
          const media = await this.mediaReferencesService.attach(entry_id, site_id, {
            url,
            mimeType: mime_type,
            altText: alt_text,
          });
          return ok(media);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'detach_media',
      {
        description:
          'Removes a media reference from a content entry. The media record is permanently deleted. Returns an empty success response on deletion.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the entry belongs to'),
          entry_id: z.string().describe('The UUID of the content entry the media is attached to'),
          media_id: z.string().describe('The UUID of the media reference to remove'),
        },
      },
      async ({ site_id, entry_id, media_id }) => {
        try {
          await this.mediaReferencesService.detach(media_id, entry_id, site_id);
          return ok({ deleted: true });
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'get_site_theme',
      {
        description:
          'Returns the active theme for a site including name, version, design tokens (CSS custom property map), and a summary of all registered components (id, slug, name, category, propsSchema). Read this before rendering or modifying theme assets.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site to fetch the theme for'),
        },
      },
      async ({ site_id }) => {
        try {
          const theme = await this.themesService.getTheme(site_id);
          if (!theme) {
            return ok(null);
          }
          return ok({
            id: theme.id,
            name: theme.name,
            version: theme.version,
            tokens: theme.tokens,
            components: theme.components.getItems().map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              category: c.category,
              propsSchema: c.propsSchema,
            })),
          });
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'import_theme',
      {
        description:
          'Imports or replaces the theme for a site in one atomic operation. Provide theme metadata (name, version, tokens map, optional rawCss) and an array of components. Existing components matched by slug are updated; new slugs are created. Returns the full updated theme.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site to import the theme into'),
          theme: z
            .object({
              name: z.string().describe('Human-readable theme name'),
              version: z.string().describe('Semantic version string, e.g. "1.0.0"'),
              tokens: z
                .record(z.string())
                .describe('CSS custom property map, e.g. { "--color-primary": "#ff0000" }'),
              raw_css: z
                .string()
                .optional()
                .nullable()
                .describe('Raw CSS injected after token declarations; sanitized server-side'),
            })
            .describe('Theme metadata'),
          components: z
            .array(
              z.object({
                slug: z.string().describe('URL-safe unique identifier for the component'),
                name: z.string().describe('Display name'),
                category: z
                  .enum([
                    ComponentCategory.LAYOUT,
                    ComponentCategory.HERO,
                    ComponentCategory.CARD,
                    ComponentCategory.ARTICLE,
                    ComponentCategory.PRODUCT,
                    ComponentCategory.MEDIA,
                    ComponentCategory.CTA,
                    ComponentCategory.NAV,
                    ComponentCategory.FOOTER,
                    ComponentCategory.MISC,
                  ])
                  .describe('Semantic category'),
                template: z.string().describe('HTML template with {{placeholder}} syntax'),
                css: z.string().optional().nullable().describe('Scoped component CSS'),
                props_schema: z
                  .record(z.string())
                  .optional()
                  .describe('Maps placeholder names to ContentEntry.body keys'),
              }),
            )
            .optional()
            .describe('Components to upsert into the theme'),
        },
      },
      async ({ site_id, theme, components }) => {
        try {
          const result = await this.themesService.importTheme(site_id, {
            theme: {
              name: theme.name,
              version: theme.version,
              tokens: theme.tokens,
              rawCss: theme.raw_css,
            },
            components: components?.map((c) => ({
              slug: c.slug,
              name: c.name,
              category: c.category,
              template: c.template,
              css: c.css,
              propsSchema: c.props_schema,
            })),
          });
          return ok(result);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'list_theme_components',
      {
        description:
          'Lists all components registered in the site theme, including full details: slug, name, category, template HTML, scoped CSS, and propsSchema. Use this to browse available components before assigning them to content types.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site whose components to list'),
        },
      },
      async ({ site_id }) => {
        try {
          const components = await this.themesService.listComponents(site_id);
          return ok(components);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'get_theme_component',
      {
        description:
          'Fetches a single theme component by its slug, including the full template HTML, scoped CSS, and propsSchema. Use before updating a component to read its current state.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the component belongs to'),
          slug: z.string().describe('The slug identifier of the component to fetch'),
        },
      },
      async ({ site_id, slug }) => {
        try {
          const component = await this.themesService.getComponent(site_id, slug);
          return ok(component);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'upsert_theme_component',
      {
        description:
          'Creates or updates a theme component identified by its slug. If a component with the given slug already exists in the site theme it is updated; otherwise a new one is created. Returns the upserted component.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site'),
          slug: z.string().describe('URL-safe unique identifier for the component'),
          name: z.string().describe('Display name'),
          category: z
            .enum([
              ComponentCategory.LAYOUT,
              ComponentCategory.HERO,
              ComponentCategory.CARD,
              ComponentCategory.ARTICLE,
              ComponentCategory.PRODUCT,
              ComponentCategory.MEDIA,
              ComponentCategory.CTA,
              ComponentCategory.NAV,
              ComponentCategory.FOOTER,
              ComponentCategory.MISC,
            ])
            .describe('Semantic category'),
          template: z.string().describe('HTML template with {{placeholder}} syntax'),
          css: z.string().optional().nullable().describe('Scoped component CSS'),
          props_schema: z
            .record(z.string())
            .optional()
            .describe('Maps placeholder names to ContentEntry.body keys'),
        },
      },
      async ({ site_id, slug, name, category, template, css, props_schema }) => {
        try {
          const component = await this.themesService.upsertComponent(site_id, slug, {
            name,
            category,
            template,
            css,
            propsSchema: props_schema,
          });
          return ok(component);
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'delete_theme_component',
      {
        description:
          'Permanently deletes a theme component by slug. Any content types assigned this component will have their component reference cleared (set null). This action is irreversible.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site the component belongs to'),
          slug: z.string().describe('The slug of the component to delete'),
        },
      },
      async ({ site_id, slug }) => {
        try {
          await this.themesService.deleteComponent(site_id, slug);
          return ok({ deleted: true });
        } catch (e) {
          return err(e);
        }
      },
    );

    server.registerTool(
      'assign_component_to_content_type',
      {
        description:
          'Assigns a theme component to a content type so that the client knows which component template to use when rendering entries of that type. Pass null for component_slug to remove an existing assignment.',
        inputSchema: {
          site_id: z.string().describe('The UUID of the site'),
          content_type_slug: z.string().describe('The slug of the content type to update'),
          component_slug: z
            .string()
            .nullable()
            .describe('The slug of the component to assign, or null to clear the assignment'),
        },
      },
      async ({ site_id, content_type_slug, component_slug }) => {
        try {
          await this.themesService.assignComponentToContentType(
            site_id,
            content_type_slug,
            component_slug,
          );
          return ok({ assigned: true });
        } catch (e) {
          return err(e);
        }
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Resources
  // ---------------------------------------------------------------------------

  private registerResources(server: McpServer): void {
    server.registerResource(
      'site_schema',
      'omnara://sites/schema',
      {
        description:
          'Returns the full data model for all sites: each site with its list of content types and field schemas. Read this resource first to understand what content types exist and what fields they require before creating or updating entries.',
        mimeType: 'application/json',
      },
      async () => {
        const sites = await this.sitesService.findAll();
        const result = await Promise.all(
          sites.map(async (site) => {
            const contentTypes = await this.contentTypesService.findAll(site.id);
            return {
              id: site.id,
              name: site.name,
              url: site.url,
              platform: site.platform,
              contentTypes: contentTypes.map((ct) => ({
                id: ct.id,
                name: ct.name,
                slug: ct.slug,
                fieldSchema: ct.fieldSchema,
              })),
            };
          }),
        );
        return {
          contents: [
            {
              uri: 'omnara://sites/schema',
              mimeType: 'application/json',
              text: JSON.stringify(result),
            },
          ],
        };
      },
    );

    const contentTypeTemplate = new ResourceTemplate('omnara://content-types/{siteId}/{slug}', {
      list: undefined,
    });

    server.registerResource(
      'content_type',
      contentTypeTemplate,
      {
        description:
          'Returns the definition of a single content type identified by its slug within a site, including the full fieldSchema. Use this to understand the exact fields (names, types, required/optional) expected in a content entry body before creating or editing content.',
        mimeType: 'application/json',
      },
      async (uri, variables) => {
        const siteId = String(variables['siteId']);
        const slug = String(variables['slug']);

        const contentTypes = await this.contentTypesService.findAll(siteId);
        const contentType = contentTypes.find((ct) => ct.slug === slug);

        if (!contentType) {
          return {
            contents: [
              {
                uri: uri.toString(),
                mimeType: 'application/json',
                text: JSON.stringify({
                  error: `Content type "${slug}" not found for site ${siteId}`,
                }),
              },
            ],
          };
        }

        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: 'application/json',
              text: JSON.stringify({
                id: contentType.id,
                name: contentType.name,
                slug: contentType.slug,
                fieldSchema: contentType.fieldSchema,
              }),
            },
          ],
        };
      },
    );

    const themeTemplate = new ResourceTemplate('theme://{siteId}', { list: undefined });

    server.registerResource(
      'site_theme',
      themeTemplate,
      {
        description:
          'Returns the full theme document for a site: name, version, design tokens (CSS custom property map), rawCss, and a complete index of all registered components (id, slug, name, category, propsSchema). Use this as a single-read snapshot before rendering or building a theme editor.',
        mimeType: 'application/json',
      },
      async (uri, variables) => {
        const siteId = String(variables['siteId']);
        const theme = await this.themesService.getTheme(siteId);

        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: 'application/json',
              text: JSON.stringify(
                theme
                  ? {
                      id: theme.id,
                      name: theme.name,
                      version: theme.version,
                      tokens: theme.tokens,
                      rawCss: theme.rawCss,
                      components: theme.components.getItems().map((c) => ({
                        id: c.id,
                        slug: c.slug,
                        name: c.name,
                        category: c.category,
                        propsSchema: c.propsSchema,
                      })),
                      updatedAt: theme.updatedAt,
                    }
                  : null,
              ),
            },
          ],
        };
      },
    );

    const themeComponentTemplate = new ResourceTemplate('theme://{siteId}/component/{slug}', {
      list: undefined,
    });

    server.registerResource(
      'theme_component',
      themeComponentTemplate,
      {
        description:
          'Returns a single theme component identified by site and slug, including the full template HTML, scoped CSS, and propsSchema. Use this when you need to read or render a specific component before modification.',
        mimeType: 'application/json',
      },
      async (uri, variables) => {
        const siteId = String(variables['siteId']);
        const slug = String(variables['slug']);

        try {
          const component = await this.themesService.getComponent(siteId, slug);
          return {
            contents: [
              {
                uri: uri.toString(),
                mimeType: 'application/json',
                text: JSON.stringify({
                  id: component.id,
                  slug: component.slug,
                  name: component.name,
                  category: component.category,
                  template: component.template,
                  css: component.css,
                  propsSchema: component.propsSchema,
                }),
              },
            ],
          };
        } catch {
          return {
            contents: [
              {
                uri: uri.toString(),
                mimeType: 'application/json',
                text: JSON.stringify({ error: `Component "${slug}" not found for site ${siteId}` }),
              },
            ],
          };
        }
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Prompts
  // ---------------------------------------------------------------------------

  private registerPrompts(server: McpServer): void {
    server.registerPrompt(
      'create_blog_post',
      {
        description:
          'Generates a step-by-step prompt for authoring and publishing a new blog post on a site. The prompt instructs you to discover the blog content type, compose the post, create a draft entry, and publish it.',
        argsSchema: {
          site_id: z.string().describe('The UUID of the site to create the blog post on'),
          topic: z.string().describe('The subject or title idea for the blog post'),
          tone: z
            .enum(['professional', 'casual', 'technical'])
            .optional()
            .describe('Writing tone — defaults to professional'),
        },
      },
      ({ site_id, topic, tone }) => {
        const toneDesc = tone ?? 'professional';
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: [
                  `You are a content author for an omnara-powered CMS. Your task is to create and publish a blog post on site ${site_id}.`,
                  '',
                  `Topic: "${topic}"`,
                  `Tone: ${toneDesc}`,
                  '',
                  'Follow these steps in order:',
                  '',
                  '1. Call `list_content_types` with the site_id to find the blog or article content type. Note its UUID and inspect its fieldSchema.',
                  '2. Compose a complete blog post (title, slug, and body JSON matching the fieldSchema) in the requested tone.',
                  '3. Call `create_content_entry` with the composed content, status "draft".',
                  '4. Review the created entry. If the content is satisfactory, call `publish_content_entry` to set it live.',
                  '5. Return the published entry URL or ID as confirmation.',
                ].join('\n'),
              },
            },
          ],
        };
      },
    );

    server.registerPrompt(
      'update_product_description',
      {
        description:
          'Generates a prompt to improve the description of an existing product content entry. The prompt instructs you to read the current entry, rewrite the body based on an improvement goal, and save the changes.',
        argsSchema: {
          site_id: z.string().describe('The UUID of the site the product entry belongs to'),
          entry_id: z.string().describe('The UUID of the product content entry to improve'),
          improvement_goal: z
            .string()
            .optional()
            .describe(
              'What to improve — e.g. "make it more concise", "add SEO keywords", "highlight key benefits"',
            ),
        },
      },
      ({ site_id, entry_id, improvement_goal }) => {
        const goal = improvement_goal ?? 'improve clarity and persuasiveness';
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: [
                  `You are a content editor for an omnara-powered CMS. Your task is to improve a product description on site ${site_id}.`,
                  '',
                  `Entry ID: ${entry_id}`,
                  `Improvement goal: ${goal}`,
                  '',
                  'Follow these steps in order:',
                  '',
                  '1. Call `get_content_entry` with site_id and entry_id to read the current content.',
                  '2. Inspect the body JSON and identify the description fields.',
                  `3. Rewrite the relevant fields to ${goal}. Preserve all other fields unchanged.`,
                  '4. Call `update_content_entry` with the improved body. Do not change the status.',
                  '5. Confirm the update was successful and summarise the key changes you made.',
                ].join('\n'),
              },
            },
          ],
        };
      },
    );

    server.registerPrompt(
      'review_and_publish',
      {
        description:
          'Generates a prompt for reviewing content entries that are in "review" status and publishing the ones that meet quality standards. If an entry_id is provided, reviews only that entry; otherwise reviews all entries pending review on the site.',
        argsSchema: {
          site_id: z.string().describe('The UUID of the site to review entries on'),
          entry_id: z
            .string()
            .optional()
            .describe(
              'UUID of a specific entry to review — if omitted, all entries in review status are evaluated',
            ),
        },
      },
      ({ site_id, entry_id }) => {
        const scope = entry_id
          ? `the specific entry ${entry_id}`
          : 'all entries currently in "review" status';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: [
                  `You are a content reviewer for an omnara-powered CMS. Your task is to review and publish approved content on site ${site_id}.`,
                  '',
                  `Scope: ${scope}`,
                  '',
                  'Follow these steps in order:',
                  '',
                  entry_id
                    ? `1. Call \`get_content_entry\` with site_id "${site_id}" and entry_id "${entry_id}" to read the entry.`
                    : '1. Call `list_content_entries` with site_id and status "review" to retrieve all entries awaiting review.',
                  '2. For each entry, evaluate:',
                  '   - Is the title clear and descriptive?',
                  '   - Is the body content complete, accurate, and free of obvious errors?',
                  "   - Does the content match the content type's expected field schema?",
                  '3. For entries that pass review, call `publish_content_entry` to set them live.',
                  '4. For entries that need revision, call `update_content_entry` to set status back to "draft" and optionally leave a note in the body.',
                  '5. Return a summary: how many entries were reviewed, published, and sent back for revision.',
                ].join('\n'),
              },
            },
          ],
        };
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------------

  trackSession(sessionId: string, server: McpServer, transport: SSEServerTransport): void {
    this.sessions.set(sessionId, { server, transport });
    this.logger.debug(`Session started: ${sessionId} (total: ${this.sessions.size})`);
  }

  getTransport(sessionId: string): SSEServerTransport | undefined {
    return this.sessions.get(sessionId)?.transport;
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.debug(`Session ended: ${sessionId} (total: ${this.sessions.size})`);
  }

  async onApplicationShutdown(): Promise<void> {
    for (const [sessionId, { server, transport }] of this.sessions) {
      await transport.close();
      await server.close();
      this.logger.debug(`Closed session: ${sessionId}`);
    }
    this.sessions.clear();
  }
}
