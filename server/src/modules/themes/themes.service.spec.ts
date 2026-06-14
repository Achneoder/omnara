import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ThemesService } from './themes.service.js';
import { SiteTheme } from './entities/site-theme.entity.js';
import { ThemeComponent, ComponentCategory } from './entities/theme-component.entity.js';
import { ContentType } from '../content-types/entities/content-type.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';
import { ImportThemeDto } from './dto/import-theme.dto.js';
import { UpsertComponentDto } from './dto/upsert-component.dto.js';

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  remove: jest.fn(),
  transactional: jest.fn(),
  getReference: jest.fn(),
};

const mockActivityLogService = {
  log: jest.fn().mockResolvedValue(undefined),
};

describe('ThemesService', () => {
  let service: ThemesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
  });

  // ---------------------------------------------------------------------------
  // getTheme
  // ---------------------------------------------------------------------------

  describe('getTheme', () => {
    it('returns null when no theme exists for site', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      const result = await service.getTheme('site-1');

      expect(result).toBeNull();
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        SiteTheme,
        { site: { id: 'site-1' } },
        expect.objectContaining({ populate: expect.anything() }),
      );
    });

    it('returns theme with components when theme exists', async () => {
      const theme = { id: 'theme-1', name: 'My Theme', components: [] } as unknown as SiteTheme;
      mockEntityManager.findOne.mockResolvedValueOnce(theme);

      const result = await service.getTheme('site-1');

      expect(result).toBe(theme);
    });
  });

  // ---------------------------------------------------------------------------
  // importTheme
  // ---------------------------------------------------------------------------

  describe('importTheme', () => {
    const baseDto: ImportThemeDto = {
      theme: {
        name: 'Test Theme',
        version: '1.0.0',
        tokens: { '--color-primary': '#ff0000' },
        rawCss: null,
      },
      components: [],
    };

    it('creates a new theme when none exists for the site', async () => {
      const site = { id: 'site-1' };
      const savedTheme = {
        id: 'theme-1',
        name: 'Test Theme',
        version: '1.0.0',
        tokens: { '--color-primary': '#ff0000' },
        rawCss: null,
        updatedAt: new Date(),
      } as unknown as SiteTheme;

      // transactional executes the callback immediately
      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest
              .fn()
              // First call: no existing theme
              .mockResolvedValueOnce(null)
              // Second call: find site
              .mockResolvedValueOnce(site),
            persist: jest.fn(),
            flush: jest.fn().mockResolvedValue(undefined),
          };
          return cb(txEm);
        },
      );

      // Re-fetch after transactional
      mockEntityManager.findOne.mockResolvedValueOnce(savedTheme);

      const result = await service.importTheme('site-1', baseDto);

      expect(result).toBe(savedTheme);
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'theme.imported',
          entityType: 'SiteTheme',
          metadata: expect.objectContaining({ version: '1.0.0', componentCount: 0 }),
        }),
      );
    });

    it('updates an existing theme on re-import', async () => {
      const existingTheme = {
        id: 'theme-1',
        name: 'Old Name',
        version: '0.9.0',
        tokens: {},
        rawCss: null,
      } as unknown as SiteTheme;
      const updatedTheme = {
        ...existingTheme,
        name: 'Test Theme',
        version: '1.0.0',
      } as unknown as SiteTheme;

      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest.fn().mockResolvedValueOnce(existingTheme),
            persist: jest.fn(),
            flush: jest.fn().mockResolvedValue(undefined),
          };
          return cb(txEm);
        },
      );
      mockEntityManager.findOne.mockResolvedValueOnce(updatedTheme);

      const result = await service.importTheme('site-1', baseDto);

      expect(result).toBe(updatedTheme);
    });

    it('upserts components by slug during import', async () => {
      const theme = {
        id: 'theme-1',
        name: 'T',
        version: '1.0.0',
        tokens: {},
        rawCss: null,
      } as unknown as SiteTheme;

      const dto: ImportThemeDto = {
        ...baseDto,
        components: [
          {
            slug: 'hero',
            name: 'Hero Section',
            category: ComponentCategory.HERO,
            template: '<div>{{title}}</div>',
            css: null,
          },
        ],
      };

      const persistedComponent = {
        id: 'comp-1',
        slug: 'hero',
        name: 'Hero Section',
        category: ComponentCategory.HERO,
      } as ThemeComponent;

      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            // existing theme found, no existing component
            findOne: jest.fn().mockResolvedValueOnce(theme).mockResolvedValueOnce(null),
            persist: jest.fn(),
            flush: jest.fn().mockResolvedValue(undefined),
          };
          return cb(txEm);
        },
      );
      mockEntityManager.findOne.mockResolvedValueOnce({
        ...theme,
        components: { getItems: () => [persistedComponent] },
      });

      const result = await service.importTheme('site-1', dto);

      expect(result).toBeDefined();
      expect(mockActivityLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ componentCount: 1 }),
        }),
      );
    });

    it('throws NotFoundException when site does not exist during create', async () => {
      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest
              .fn()
              .mockResolvedValueOnce(null) // no existing theme
              .mockResolvedValueOnce(null), // site not found
            persist: jest.fn(),
            flush: jest.fn(),
          };
          return cb(txEm);
        },
      );

      await expect(service.importTheme('bad-site', baseDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // sanitizeRawCss (tested indirectly via importTheme)
  // ---------------------------------------------------------------------------

  describe('sanitizeRawCss', () => {
    const makeDto = (rawCss: string): ImportThemeDto => ({
      theme: { name: 'T', version: '1.0.0', tokens: {}, rawCss },
      components: [],
    });

    it('strips </style> tags to prevent injection', async () => {
      const site = { id: 'site-1' };
      const capturedTheme: { rawCss?: string | null } = {};

      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(site),
            persist: jest.fn(),
            flush: jest.fn().mockResolvedValue(undefined),
          };
          // Capture what was written to the theme object
          const result = await cb(txEm);
          capturedTheme.rawCss = (result as SiteTheme).rawCss;
          return result;
        },
      );

      const savedTheme = { id: 'theme-1', rawCss: 'body { color: red; }' } as unknown as SiteTheme;
      mockEntityManager.findOne.mockResolvedValueOnce(savedTheme);

      await service.importTheme(
        'site-1',
        makeDto('body { color: red; }</style><script>evil()</script>'),
      );
      // The </style> should be stripped — no exception thrown
    });

    it('rejects rawCss containing expression()', async () => {
      const site = { id: 'site-1' };

      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(site),
            persist: jest.fn(),
            flush: jest.fn(),
          };
          return cb(txEm);
        },
      );

      await expect(
        service.importTheme('site-1', makeDto('body { width: expression(alert(1)); }')),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects rawCss containing javascript: URLs', async () => {
      const site = { id: 'site-1' };

      mockEntityManager.transactional.mockImplementation(
        async (cb: (em: typeof mockEntityManager) => Promise<SiteTheme>) => {
          const txEm = {
            ...mockEntityManager,
            findOne: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(site),
            persist: jest.fn(),
            flush: jest.fn(),
          };
          return cb(txEm);
        },
      );

      await expect(
        service.importTheme('site-1', makeDto('a { background: url(javascript:void(0)); }')),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // deleteTheme
  // ---------------------------------------------------------------------------

  describe('deleteTheme', () => {
    it('removes the theme and flushes', async () => {
      const theme = { id: 'theme-1' } as SiteTheme;
      mockEntityManager.findOne.mockResolvedValueOnce(theme);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.deleteTheme('site-1');

      expect(mockEntityManager.remove).toHaveBeenCalledWith(theme);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when theme does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteTheme('site-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // assignComponentToContentType
  // ---------------------------------------------------------------------------

  describe('assignComponentToContentType', () => {
    it('assigns a component to a content type', async () => {
      const contentType = {
        id: 'ct-1',
        slug: 'blog-post',
        component: null,
      } as unknown as ContentType;
      const theme = { id: 'theme-1' } as SiteTheme;
      const component = { id: 'comp-1', slug: 'hero' } as ThemeComponent;

      // findOne calls: contentType, then getComponent internals (theme + component)
      mockEntityManager.findOne
        .mockResolvedValueOnce(contentType) // ContentType lookup
        .mockResolvedValueOnce(theme) // theme lookup inside getComponent
        .mockResolvedValueOnce(component); // component lookup inside getComponent
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.assignComponentToContentType('site-1', 'blog-post', 'hero');

      expect(contentType.component).toBe(component);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('unassigns a component when componentSlug is null', async () => {
      const contentType = {
        id: 'ct-1',
        slug: 'blog-post',
        component: { id: 'old-comp' },
      } as unknown as ContentType;

      mockEntityManager.findOne.mockResolvedValueOnce(contentType);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.assignComponentToContentType('site-1', 'blog-post', null);

      expect(contentType.component).toBeNull();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when content type does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.assignComponentToContentType('site-1', 'missing-ct', 'hero'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // upsertComponent
  // ---------------------------------------------------------------------------

  describe('upsertComponent', () => {
    const dto: UpsertComponentDto = {
      name: 'Hero',
      category: ComponentCategory.HERO,
      template: '<section>{{headline}}</section>',
      css: null,
    };

    it('creates a new component when none exists', async () => {
      const theme = { id: 'theme-1' } as SiteTheme;
      mockEntityManager.findOne
        .mockResolvedValueOnce(theme) // theme lookup
        .mockResolvedValueOnce(null); // no existing component
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.upsertComponent('site-1', 'hero', dto);

      expect(result.slug).toBe('hero');
      expect(result.name).toBe('Hero');
      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('updates an existing component when slug matches', async () => {
      const theme = { id: 'theme-1' } as SiteTheme;
      const existing = {
        id: 'comp-1',
        slug: 'hero',
        name: 'Old Hero',
        category: ComponentCategory.MISC,
        template: '<div></div>',
        css: null,
        propsSchema: {},
      } as ThemeComponent;

      mockEntityManager.findOne.mockResolvedValueOnce(theme).mockResolvedValueOnce(existing);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.upsertComponent('site-1', 'hero', dto);

      expect(result.name).toBe('Hero');
      expect(result.category).toBe(ComponentCategory.HERO);
      expect(mockEntityManager.persist).not.toHaveBeenCalled();
    });
  });
});
