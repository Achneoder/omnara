import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, CreateUserData } from './users.service.js';
import { User, UserRole } from './entities/user.entity.js';
import { EntityManager } from '@mikro-orm/postgresql';

const mockEntityManager = {
  findOne: jest.fn(),
  create: jest.fn(),
  flush: jest.fn(),
  persist: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('returns user when found (normalizes to lowercase)', async () => {
      const user = { id: 'uuid-1', email: 'test@example.com' } as User;
      mockEntityManager.findOne.mockResolvedValueOnce(user);

      const result = await service.findByEmail('TEST@EXAMPLE.COM');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, {
        email: 'test@example.com',
      });
      expect(result).toBe(user);
    });

    it('returns null when not found', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      const result = await service.findByEmail('noone@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const user = { id: 'uuid-1', email: 'test@example.com' } as User;
      mockEntityManager.findOne.mockResolvedValueOnce(user);

      const result = await service.findById('uuid-1');

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(User, { id: 'uuid-1' });
      expect(result).toBe(user);
    });

    it('returns null when not found', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates, persists, and flushes user', async () => {
      const data: CreateUserData = {
        email: 'new@example.com',
        passwordHash: 'hash',
        role: UserRole.ADMIN,
      };
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.create(data);

      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(result.passwordHash).toBe('hash');
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('updateFailedAttempts', () => {
    it('updates count and lockedUntil then flushes', async () => {
      const user = {
        id: 'uuid-1',
        failedLoginAttempts: 0,
        lockedUntil: null,
      } as User;
      const lockDate = new Date();
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.updateFailedAttempts(user, 5, lockDate);

      expect(user.failedLoginAttempts).toBe(5);
      expect(user.lockedUntil).toBe(lockDate);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });
  });
});
