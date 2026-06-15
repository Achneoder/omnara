import { Test, TestingModule } from '@nestjs/testing';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { NotFoundException } from '@nestjs/common';
import { McpService } from './mcp.service.js';
import { SitesService } from '../sites/sites.service.js';
import { ContentTypesService } from '../content-types/content-types.service.js';
import { ContentEntriesService } from '../content-entries/content-entries.service.js';
import { MediaReferencesService } from '../media-references/media-references.service.js';
import { ThemesService } from '../themes/themes.service.js';
import { PagesService } from '../pages/pages.service.js';
import { NavigationService } from '../navigation/navigation.service.js';
import { AssetsService } from '../assets/assets.service.js';
import { WebhooksService } from '../webhooks/webhooks.service.js';
import { ContentStatus } from '../content-entries/entities/content-entry.entity.js';

// ---------------------------------------------------------------------------
// Helpers to invoke registered tools and resources directly from the server
// ---------------------------------------------------------------------------

type InternalTool = {
  handler: (args: Record<string, unknown>, extra: unknown) => Promise<unknown>;
};
type InternalResource = { readCallback: (uri: URL, extra: unknown) => Promise<unknown> };
type InternalResourceTemplate = {
  readCallback: (uri: URL, variables: Record<string, string>, extra: unknown) => Promise<unknown>;
};
type InternalPrompt = { callback: (args: Record<string, unknown>, extra: unknown) => unknown };

type InternalMcpServer = {
  _registeredTools: Record<string, InternalTool>;
  _registeredResources: Record<string, InternalResource>;
  _registeredResourceTemplates: Record<string, InternalResourceTemplate>;
  _registeredPrompts: Record<string, InternalPrompt>;
};

async function callTool(
  server: McpServer,
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const internal = server as unknown as InternalMcpServer;
  const result = await internal._registeredTools[name].handler(args, {});
  return result as { content: Array<{ type: string; text: string }>; isError?: boolean };
}

async function callResource(
  server: McpServer,
  name: string,
  uri: string,
  variables: Record<string, string> = {},
): Promise<{ contents: Array<{ uri: string; text: string }> }> {
  const internal = server as unknown as InternalMcpServer;

  if (internal._registeredResources[uri]) {
    const result = await internal._registeredResources[uri].readCallback(new URL(uri), {});
    return result as { contents: Array<{ uri: string; text: string }> };
  }

  if (internal._registeredResourceTemplates[name]) {
    const result = await internal._registeredResourceTemplates[name].readCallback(
      new URL(uri),
      variables,
      {},
    );
    return result as { contents: Array<{ uri: string; text: string }> };
  }

  throw new Error(`Resource "${name}" / "${uri}" not registered`);
}

async function callPrompt(
  server: McpServer,
  name: string,
  args: Record<string, unknown>,
): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }> {
  const internal = server as unknown as InternalMcpServer;
  const result = internal._registeredPrompts[name].callback(args, {});
  return result as { messages: Array<{ role: string; content: { type: string; text: string } }> };
}

// ---------------------------------------------------------------------------
// Mock services
// ---------------------------------------------------------------------------

const mockSitesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockContentTypesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockContentEntriesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
};

const mockMediaReferencesService = {
  findByEntry: jest.fn(),
  attach: jest.fn(),
  detach: jest.fn(),
};

const mockThemesService = {
  getTheme: jest.fn(),
  importTheme: jest.fn(),
  listComponents: jest.fn(),
  getComponent: jest.fn(),
  upsertComponent: jest.fn(),
  deleteComponent: jest.fn(),
  assignComponentToContentType: jest.fn(),
  deleteTheme: jest.fn(),
  updateTheme: jest.fn(),
};

const mockPagesService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  addSection: jest.fn(),
  updateSection: jest.fn(),
  removeSection: jest.fn(),
  reorderSections: jest.fn(),
  findBySlug: jest.fn(),
  findHomepage: jest.fn(),
};

const mockNavigationService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  reorder: jest.fn(),
};

const mockAssetsService = {
  store: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  remove: jest.fn(),
  getAbsolutePath: jest.fn(),
};

const mockWebhooksService = {
  findAll: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
};

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const site = {
  id: 'site-1',
  name: 'Test Site',
  url: 'https://test.com',
  platform: 'custom',
  settings: {},
};
const contentType = {
  id: 'ct-1',
  name: 'Blog Post',
  slug: 'blog_post',
  fieldSchema: { title: 'string' },
};
const contentEntry = {
  id: 'entry-1',
  title: 'Hello World',
  slug: 'hello-world',
  body: { content: 'test' },
  status: ContentStatus.DRAFT,
  publishedAt: null,
  authorSessionId: null,
};
const mediaReference = {
  id: 'media-1',
  url: 'https://cdn.test/img.jpg',
  mimeType: 'image/jpeg',
  altText: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('McpService', () => {
  let service: McpService;
  let server: McpServer;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        { provide: SitesService, useValue: mockSitesService },
        { provide: ContentTypesService, useValue: mockContentTypesService },
        { provide: ContentEntriesService, useValue: mockContentEntriesService },
        { provide: MediaReferencesService, useValue: mockMediaReferencesService },
        { provide: ThemesService, useValue: mockThemesService },
        { provide: PagesService, useValue: mockPagesService },
        { provide: NavigationService, useValue: mockNavigationService },
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: WebhooksService, useValue: mockWebhooksService },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
    server = service.createServer();
  });

  // -------------------------------------------------------------------------
  // Session lifecycle
  // -------------------------------------------------------------------------

  describe('session management', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('createServer returns an McpServer instance', () => {
      expect(server).toBeInstanceOf(McpServer);
    });

    it('tracks and retrieves a session transport', () => {
      const transport = { sessionId: 'test-session' } as unknown as SSEServerTransport;
      const mockServer = {} as unknown as McpServer;
      service.trackSession('test-session', mockServer, transport);
      expect(service.getTransport('test-session')).toBe(transport);
    });

    it('removes a session', () => {
      const transport = { sessionId: 'to-remove' } as unknown as SSEServerTransport;
      const mockServer = {} as unknown as McpServer;
      service.trackSession('to-remove', mockServer, transport);
      service.removeSession('to-remove');
      expect(service.getTransport('to-remove')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Tool: list_sites
  // -------------------------------------------------------------------------

  describe('tool: list_sites', () => {
    it('returns all sites on success', async () => {
      mockSitesService.findAll.mockResolvedValue([site]);

      const result = await callTool(server, 'list_sites', {});

      expect(mockSitesService.findAll).toHaveBeenCalled();
      expect(result.isError).toBeFalsy();
      const data = JSON.parse(result.content[0].text);
      expect(data[0].id).toBe('site-1');
    });

    it('returns isError when service throws', async () => {
      mockSitesService.findAll.mockRejectedValue(new Error('DB failure'));

      const result = await callTool(server, 'list_sites', {});

      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).error).toMatch('DB failure');
    });
  });

  // -------------------------------------------------------------------------
  // Tool: list_content_types
  // -------------------------------------------------------------------------

  describe('tool: list_content_types', () => {
    it('returns content types for the given site', async () => {
      mockContentTypesService.findAll.mockResolvedValue([contentType]);

      const result = await callTool(server, 'list_content_types', { site_id: 'site-1' });

      expect(mockContentTypesService.findAll).toHaveBeenCalledWith('site-1');
      expect(result.isError).toBeFalsy();
      const data = JSON.parse(result.content[0].text);
      expect(data[0].slug).toBe('blog_post');
    });

    it('returns isError when service throws', async () => {
      mockContentTypesService.findAll.mockRejectedValue(new NotFoundException('Site not found'));

      const result = await callTool(server, 'list_content_types', { site_id: 'missing' });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: list_content_entries
  // -------------------------------------------------------------------------

  describe('tool: list_content_entries', () => {
    it('calls findAll with correct filters and returns entries', async () => {
      mockContentEntriesService.findAll.mockResolvedValue([contentEntry]);

      const result = await callTool(server, 'list_content_entries', {
        site_id: 'site-1',
        status: ContentStatus.DRAFT,
        content_type_id: 'ct-1',
      });

      expect(mockContentEntriesService.findAll).toHaveBeenCalledWith('site-1', {
        contentTypeId: 'ct-1',
        status: ContentStatus.DRAFT,
        createdAfter: undefined,
        createdBefore: undefined,
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.findAll.mockRejectedValue(new Error('error'));

      const result = await callTool(server, 'list_content_entries', { site_id: 'site-1' });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: get_content_entry
  // -------------------------------------------------------------------------

  describe('tool: get_content_entry', () => {
    it('returns entry on success', async () => {
      mockContentEntriesService.findOne.mockResolvedValue(contentEntry);

      const result = await callTool(server, 'get_content_entry', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      expect(mockContentEntriesService.findOne).toHaveBeenCalledWith('entry-1', 'site-1');
      expect(result.isError).toBeFalsy();
      expect(JSON.parse(result.content[0].text).id).toBe('entry-1');
    });

    it('returns isError when entry is not found', async () => {
      mockContentEntriesService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      const result = await callTool(server, 'get_content_entry', {
        site_id: 'site-1',
        entry_id: 'missing',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: create_content_entry
  // -------------------------------------------------------------------------

  describe('tool: create_content_entry', () => {
    it('creates entry and returns it on success', async () => {
      mockContentEntriesService.create.mockResolvedValue(contentEntry);

      const result = await callTool(server, 'create_content_entry', {
        site_id: 'site-1',
        content_type_id: 'ct-1',
        title: 'Hello World',
        slug: 'hello-world',
        body: { content: 'test' },
      });

      expect(mockContentEntriesService.create).toHaveBeenCalledWith(
        'site-1',
        expect.objectContaining({
          contentTypeId: 'ct-1',
          title: 'Hello World',
          slug: 'hello-world',
        }),
      );
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.create.mockRejectedValue(
        new NotFoundException('ContentType not found'),
      );

      const result = await callTool(server, 'create_content_entry', {
        site_id: 'site-1',
        content_type_id: 'bad-id',
        title: 'T',
        slug: 's',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: update_content_entry
  // -------------------------------------------------------------------------

  describe('tool: update_content_entry', () => {
    it('updates and returns the entry', async () => {
      const updated = { ...contentEntry, title: 'Updated' };
      mockContentEntriesService.update.mockResolvedValue(updated);

      const result = await callTool(server, 'update_content_entry', {
        site_id: 'site-1',
        entry_id: 'entry-1',
        title: 'Updated',
      });

      expect(mockContentEntriesService.update).toHaveBeenCalledWith(
        'entry-1',
        'site-1',
        expect.objectContaining({ title: 'Updated' }),
      );
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.update.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'update_content_entry', {
        site_id: 'site-1',
        entry_id: 'bad',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: delete_content_entry
  // -------------------------------------------------------------------------

  describe('tool: delete_content_entry', () => {
    it('deletes entry and returns deleted:true', async () => {
      mockContentEntriesService.remove.mockResolvedValue(undefined);

      const result = await callTool(server, 'delete_content_entry', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      expect(mockContentEntriesService.remove).toHaveBeenCalledWith('entry-1', 'site-1');
      expect(JSON.parse(result.content[0].text)).toEqual({ deleted: true });
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.remove.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'delete_content_entry', {
        site_id: 'site-1',
        entry_id: 'bad',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: publish_content_entry
  // -------------------------------------------------------------------------

  describe('tool: publish_content_entry', () => {
    it('publishes entry and returns it', async () => {
      const published = { ...contentEntry, status: ContentStatus.LIVE };
      mockContentEntriesService.publish.mockResolvedValue(published);

      const result = await callTool(server, 'publish_content_entry', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      expect(mockContentEntriesService.publish).toHaveBeenCalledWith('entry-1', 'site-1');
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.publish.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'publish_content_entry', {
        site_id: 'site-1',
        entry_id: 'bad',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: unpublish_content_entry
  // -------------------------------------------------------------------------

  describe('tool: unpublish_content_entry', () => {
    it('unpublishes entry and returns it', async () => {
      mockContentEntriesService.unpublish.mockResolvedValue(contentEntry);

      const result = await callTool(server, 'unpublish_content_entry', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      expect(mockContentEntriesService.unpublish).toHaveBeenCalledWith('entry-1', 'site-1');
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockContentEntriesService.unpublish.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'unpublish_content_entry', {
        site_id: 'site-1',
        entry_id: 'bad',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: attach_media
  // -------------------------------------------------------------------------

  describe('tool: attach_media', () => {
    it('attaches media and returns the reference', async () => {
      mockMediaReferencesService.attach.mockResolvedValue(mediaReference);

      const result = await callTool(server, 'attach_media', {
        site_id: 'site-1',
        entry_id: 'entry-1',
        url: 'https://cdn.test/img.jpg',
        mime_type: 'image/jpeg',
        alt_text: 'A test image',
      });

      expect(mockMediaReferencesService.attach).toHaveBeenCalledWith('entry-1', 'site-1', {
        url: 'https://cdn.test/img.jpg',
        mimeType: 'image/jpeg',
        altText: 'A test image',
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError when service throws', async () => {
      mockMediaReferencesService.attach.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'attach_media', {
        site_id: 'site-1',
        entry_id: 'bad',
        url: 'https://example.com/img.jpg',
        mime_type: 'image/jpeg',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tool: detach_media
  // -------------------------------------------------------------------------

  describe('tool: detach_media', () => {
    it('detaches media and returns deleted:true', async () => {
      mockMediaReferencesService.detach.mockResolvedValue(undefined);

      const result = await callTool(server, 'detach_media', {
        site_id: 'site-1',
        entry_id: 'entry-1',
        media_id: 'media-1',
      });

      expect(mockMediaReferencesService.detach).toHaveBeenCalledWith(
        'media-1',
        'entry-1',
        'site-1',
      );
      expect(JSON.parse(result.content[0].text)).toEqual({ deleted: true });
    });

    it('returns isError when service throws', async () => {
      mockMediaReferencesService.detach.mockRejectedValue(new NotFoundException());

      const result = await callTool(server, 'detach_media', {
        site_id: 'site-1',
        entry_id: 'entry-1',
        media_id: 'bad',
      });

      expect(result.isError).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Resource: site_schema
  // -------------------------------------------------------------------------

  describe('resource: site_schema', () => {
    it('returns all sites with their content types', async () => {
      mockSitesService.findAll.mockResolvedValue([site]);
      mockContentTypesService.findAll.mockResolvedValue([contentType]);

      const result = await callResource(server, 'site_schema', 'omnara://sites/schema');

      expect(result.contents[0].uri).toBe('omnara://sites/schema');
      const data = JSON.parse(result.contents[0].text);
      expect(data[0].id).toBe('site-1');
      expect(data[0].contentTypes[0].slug).toBe('blog_post');
    });
  });

  // -------------------------------------------------------------------------
  // Resource: content_type
  // -------------------------------------------------------------------------

  describe('resource: content_type', () => {
    it('returns the matching content type by slug', async () => {
      mockContentTypesService.findAll.mockResolvedValue([contentType]);

      const result = await callResource(
        server,
        'content_type',
        'omnara://content-types/site-1/blog_post',
        { siteId: 'site-1', slug: 'blog_post' },
      );

      const data = JSON.parse(result.contents[0].text);
      expect(data.slug).toBe('blog_post');
      expect(data.fieldSchema).toEqual({ title: 'string' });
    });

    it('returns an error body when slug does not match', async () => {
      mockContentTypesService.findAll.mockResolvedValue([contentType]);

      const result = await callResource(
        server,
        'content_type',
        'omnara://content-types/site-1/nonexistent',
        { siteId: 'site-1', slug: 'nonexistent' },
      );

      const data = JSON.parse(result.contents[0].text);
      expect(data.error).toMatch('nonexistent');
    });
  });

  // -------------------------------------------------------------------------
  // Prompt: create_blog_post
  // -------------------------------------------------------------------------

  describe('prompt: create_blog_post', () => {
    it('returns a user message with required steps', async () => {
      const result = await callPrompt(server, 'create_blog_post', {
        site_id: 'site-1',
        topic: 'AI in CMS',
        tone: 'technical',
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      const text = result.messages[0].content.text;
      expect(text).toContain('site-1');
      expect(text).toContain('AI in CMS');
      expect(text).toContain('technical');
      expect(text).toContain('list_content_types');
      expect(text).toContain('create_content_entry');
      expect(text).toContain('publish_content_entry');
    });

    it('defaults tone to professional when omitted', async () => {
      const result = await callPrompt(server, 'create_blog_post', {
        site_id: 'site-1',
        topic: 'Test',
      });

      expect(result.messages[0].content.text).toContain('professional');
    });
  });

  // -------------------------------------------------------------------------
  // Prompt: update_product_description
  // -------------------------------------------------------------------------

  describe('prompt: update_product_description', () => {
    it('returns a user message referencing the entry and goal', async () => {
      const result = await callPrompt(server, 'update_product_description', {
        site_id: 'site-1',
        entry_id: 'entry-1',
        improvement_goal: 'add SEO keywords',
      });

      const text = result.messages[0].content.text;
      expect(text).toContain('entry-1');
      expect(text).toContain('add SEO keywords');
      expect(text).toContain('get_content_entry');
      expect(text).toContain('update_content_entry');
    });

    it('defaults goal when improvement_goal is omitted', async () => {
      const result = await callPrompt(server, 'update_product_description', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      expect(result.messages[0].content.text).toContain('clarity');
    });
  });

  // -------------------------------------------------------------------------
  // Prompt: review_and_publish
  // -------------------------------------------------------------------------

  describe('prompt: review_and_publish', () => {
    it('returns a prompt scoped to a specific entry when entry_id is provided', async () => {
      const result = await callPrompt(server, 'review_and_publish', {
        site_id: 'site-1',
        entry_id: 'entry-1',
      });

      const text = result.messages[0].content.text;
      expect(text).toContain('entry-1');
      expect(text).toContain('get_content_entry');
      expect(text).toContain('publish_content_entry');
    });

    it('returns a prompt that lists all review-status entries when entry_id is omitted', async () => {
      const result = await callPrompt(server, 'review_and_publish', { site_id: 'site-1' });

      const text = result.messages[0].content.text;
      expect(text).toContain('list_content_entries');
      expect(text).toContain('review');
    });
  });
});
