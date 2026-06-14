import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { PagesService } from './pages.service.js';
import { Page, PageStatus } from './entities/page.entity.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';

// Using mutable variables so tests can control mock returns without
// mockResolvedValueOnce chain ordering issues across tests
let mockPage: Record<string, unknown> | null;
let mockComponent: Record<string, unknown> | null;
let mockPageList: unknown[];
let mockExistingHomepage: Record<string, unknown> | null;

const mockEm = {
  find: jest.fn().mockImplementation(() => Promise.resolve(mockPageList)),
  findOne: jest.fn().mockImplementation((entity: unknown) => {
    // Return different values based on entity type
    if (entity === Page) return Promise.resolve(mockPage);
    // Assume ThemeComponent query
    return Promise.resolve(mockComponent);
  }),
  persist: jest.fn(),
  flush: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn(),
  getReference: jest.fn().mockReturnValue({ id: 'site-1' }),
};

const mockActivityLogService = {
  log: jest.fn().mockResolvedValue(undefined),
};

function defaultPage(): Record<string, unknown> {
  return {
    id: 'page-1',
    title: 'About',
    slug: 'about',
    isHomepage: false,
    meta: {},
    status: PageStatus.DRAFT,
    sortOrder: 0,
    site: { id: 'site-1' },
    sections: { getItems: () => [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function defaultComponent(): Record<string, unknown> {
  return { id: 'comp-1', slug: 'hero', name: 'Hero' };
}

describe('PagesService', () => {
  let service: PagesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPage = defaultPage();
    mockComponent = defaultComponent();
    mockPageList = [];
    mockExistingHomepage = null;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: EntityManager, useValue: mockEm },
        { provide: ActivityLogService, useValue: mockActivityLogService },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
  });

  describe('create', () => {
    it('creates a page with required fields', async () => {
      mockPageList = []; // clearOtherHomepages: no existing homepages

      const result = await service.create('site-1', { title: 'About', slug: 'about' });

      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.title).toBe('About');
      expect(result.slug).toBe('about');
      expect(result.status).toBe(PageStatus.DRAFT);
    });

    it('accepts an explicit status', async () => {
      mockPageList = [];

      const result = await service.create('site-1', {
        title: 'Page',
        slug: 'page',
        status: PageStatus.PUBLISHED,
      });

      expect(result.status).toBe(PageStatus.PUBLISHED);
    });

    it('clears existing homepage when isHomepage is true', async () => {
      mockExistingHomepage = { id: 'old-homepage', isHomepage: true };
      mockPageList = [mockExistingHomepage]; // clearOtherHomepages returns this

      await service.create('site-1', {
        title: 'New Home',
        slug: 'home',
        isHomepage: true,
      });

      expect(mockExistingHomepage.isHomepage).toBe(false);
    });
  });

  describe('findOne', () => {
    it('returns page with sections populated', async () => {
      mockPage = defaultPage();
      const result = await service.findOne('site-1', 'page-1');
      expect(result).toBe(mockPage);
    });

    it('throws NotFoundException when page does not exist', async () => {
      mockPage = null;
      await expect(service.findOne('site-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all pages for a site', async () => {
      mockPageList = [
        defaultPage(),
        { ...defaultPage(), id: 'page-2', title: 'Contact', slug: 'contact' },
      ];

      const result = await service.findAll('site-1');

      expect(result).toHaveLength(2);
    });

    it('filters by status when provided', async () => {
      mockPageList = [];

      await service.findAll('site-1', PageStatus.PUBLISHED);

      expect(mockEm.find).toHaveBeenCalledWith(
        Page,
        { site: { id: 'site-1' }, status: PageStatus.PUBLISHED },
        { orderBy: { sortOrder: 'ASC' } },
      );
    });
  });

  describe('update', () => {
    it('updates provided fields', async () => {
      mockPage = { ...defaultPage() };

      const result = await service.update('site-1', 'page-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('clears other homepages when isHomepage transitions to true', async () => {
      mockPage = { ...defaultPage(), isHomepage: false };
      mockPageList = []; // no existing homepages

      await service.update('site-1', 'page-1', { isHomepage: true });

      expect(mockPage.isHomepage).toBe(true);
    });
  });

  describe('remove', () => {
    it('removes page and returns', async () => {
      mockPage = { ...defaultPage() };

      await service.remove('site-1', 'page-1');

      expect(mockEm.remove).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('sets status to published', async () => {
      mockPage = { ...defaultPage() };

      const result = await service.publish('site-1', 'page-1');

      expect(result.status).toBe(PageStatus.PUBLISHED);
    });
  });

  describe('unpublish', () => {
    it('sets status to draft', async () => {
      mockPage = { ...defaultPage(), status: PageStatus.PUBLISHED };

      const result = await service.unpublish('site-1', 'page-1');

      expect(result.status).toBe(PageStatus.DRAFT);
    });
  });

  describe('addSection', () => {
    it('adds a section with component lookup by slug', async () => {
      mockPage = { ...defaultPage() };
      mockComponent = defaultComponent();
      mockPageList = []; // existing sections lookup returns empty

      const result = await service.addSection('site-1', 'page-1', {
        componentSlug: 'hero',
      });

      expect(result.component).toBe(mockComponent);
      expect(result.sortOrder).toBe(0);
      expect(mockEm.persist).toHaveBeenCalled();
    });

    it('throws NotFoundException when component slug not found', async () => {
      mockPage = { ...defaultPage() };
      mockComponent = null; // component NOT found

      await expect(
        service.addSection('site-1', 'page-1', { componentSlug: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('assigns sortOrder as max+1 when not specified', async () => {
      mockPage = { ...defaultPage() };
      mockComponent = defaultComponent();
      mockPageList = [{ sortOrder: 5 }]; // existing sections

      const result = await service.addSection('site-1', 'page-1', {
        componentSlug: 'hero',
      });

      expect(result.sortOrder).toBe(6);
    });
  });

  describe('reorderSections', () => {
    it('assigns sortOrder based on array position', async () => {
      mockPage = { ...defaultPage() };
      const sec1 = { id: 'sec-3', sortOrder: 99, page: { id: 'page-1' } };
      const sec2 = { id: 'sec-1', sortOrder: 0, page: { id: 'page-1' } };
      const sec3 = { id: 'sec-2', sortOrder: 1, page: { id: 'page-1' } };
      mockPageList = [sec1, sec2, sec3]; // PageSection find returns these

      await service.reorderSections('site-1', 'page-1', ['sec-1', 'sec-2', 'sec-3']);

      expect(sec1.sortOrder).toBe(2); // sec-3 → index 2
      expect(sec2.sortOrder).toBe(0); // sec-1 → index 0
      expect(sec3.sortOrder).toBe(1); // sec-2 → index 1
    });
  });

  describe('findBySlug', () => {
    it('returns published page when slug matches', async () => {
      mockPage = { ...defaultPage(), status: PageStatus.PUBLISHED };

      const result = await service.findBySlug('site-1', 'about');

      expect(result).toBe(mockPage);
    });

    it('returns null when no match', async () => {
      mockPage = null;

      const result = await service.findBySlug('site-1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findHomepage', () => {
    it('returns published homepage when one exists', async () => {
      mockPage = { ...defaultPage(), isHomepage: true, status: PageStatus.PUBLISHED };

      const result = await service.findHomepage('site-1');

      expect(result).toBe(mockPage);
    });

    it('returns null when no homepage exists', async () => {
      mockPage = null;

      const result = await service.findHomepage('site-1');

      expect(result).toBeNull();
    });
  });
});
