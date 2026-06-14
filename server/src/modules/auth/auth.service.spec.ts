import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { RefreshToken } from '../users/entities/refresh-token.entity.js';

jest.mock('argon2');
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateFailedAttempts: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn(),
  get: jest.fn(),
};

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  flush: jest.fn(),
  persist: jest.fn(),
  transactional: jest.fn(),
};

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.EDITOR,
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    normalizeEmail: jest.fn(),
    ...overrides,
  } as unknown as User;
}

function makeRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    id: 'token-uuid',
    user: makeUser(),
    tokenHash: 'hashed-token',
    familyId: 'family-uuid',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: new Date(),
    ...overrides,
  } as unknown as RefreshToken;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default config mock values
    mockConfigService.getOrThrow.mockReturnValue('test-secret');
    mockConfigService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'JWT_EXPIRY') return '15m';
      if (key === 'REFRESH_TOKEN_EXPIRY_DAYS') return 7;
      return fallback;
    });

    // Default entity manager transactional runs the callback
    mockEntityManager.transactional.mockImplementation(
      async (cb: (em: typeof mockEntityManager) => Promise<void>) => cb(mockEntityManager),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns accessToken and sets refresh token on success', async () => {
      const user = makeUser();
      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockResolvedValueOnce('access.jwt.token');
      mockedArgon2.hash.mockResolvedValueOnce('hashed-refresh-token');
      mockEntityManager.create.mockReturnValueOnce(makeRefreshToken());
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await service.login('test@example.com', 'correct-password');

      expect(result.accessToken).toBe('access.jwt.token');
      expect(result.user).toMatchObject({ id: user.id, email: user.email, role: user.role });
      expect(result.refreshToken).toMatch(/^[0-9a-f-]{36}\.[0-9a-f-]{36}$/i);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const user = makeUser();
      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(false);
      mockUsersService.updateFailedAttempts.mockResolvedValueOnce(undefined);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.updateFailedAttempts).toHaveBeenCalledWith(user, 1, null);
    });

    it('locks account after 5 failed attempts', async () => {
      const user = makeUser({ failedLoginAttempts: 4 });
      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(false);
      mockUsersService.updateFailedAttempts.mockResolvedValueOnce(undefined);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.updateFailedAttempts).toHaveBeenCalledWith(user, 5, expect.any(Date));
    });

    it('throws UnauthorizedException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      const user = makeUser({ lockedUntil });
      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      // verify still runs (timing-safe), but lockout check happens first
      mockedArgon2.verify.mockResolvedValueOnce(true);

      await expect(service.login('test@example.com', 'any')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found (runs dummy hash)', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      // Argon2 verify still called with dummy hash — returns false
      mockedArgon2.verify.mockResolvedValueOnce(false);

      await expect(service.login('ghost@example.com', 'anything')).rejects.toThrow(
        UnauthorizedException,
      );

      // No failed attempt update when user doesn't exist
      expect(mockUsersService.updateFailedAttempts).not.toHaveBeenCalled();
    });

    it('clears lockout on successful login after previous failures', async () => {
      const user = makeUser({ failedLoginAttempts: 3, lockedUntil: null });
      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockUsersService.updateFailedAttempts.mockResolvedValueOnce(undefined);
      mockJwtService.signAsync.mockResolvedValueOnce('access.jwt.token');
      mockedArgon2.hash.mockResolvedValueOnce('hashed-refresh-token');
      mockEntityManager.create.mockReturnValueOnce(makeRefreshToken());
      mockEntityManager.flush.mockResolvedValue(undefined);

      await service.login('test@example.com', 'correct');

      expect(mockUsersService.updateFailedAttempts).toHaveBeenCalledWith(user, 0, null);
    });
  });

  // ─── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('rotates token on valid refresh token', async () => {
      const familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const rawToken = `${familyId}.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`;
      const existingToken = makeRefreshToken({ familyId });

      mockEntityManager.find.mockResolvedValueOnce([existingToken]);
      mockedArgon2.verify.mockResolvedValueOnce(true); // matches existing token
      mockEntityManager.transactional.mockImplementationOnce(
        async (cb: (em: typeof mockEntityManager) => Promise<void>) => cb(mockEntityManager),
      );
      mockJwtService.signAsync.mockResolvedValueOnce('new.access.token');
      mockedArgon2.hash.mockResolvedValueOnce('new-hashed-token');
      mockEntityManager.create.mockReturnValueOnce(makeRefreshToken({ familyId }));
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('new.access.token');
      expect(result.refreshToken).toMatch(/^[0-9a-f-]{36}\.[0-9a-f-]{36}$/i);
      expect(existingToken.revokedAt).toBeInstanceOf(Date);
    });

    it('throws on revoked token reuse (theft detection) — revokes entire family', async () => {
      const familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const rawToken = `${familyId}.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`;
      const revokedToken = makeRefreshToken({
        familyId,
        revokedAt: new Date(Date.now() - 1000),
      });

      mockEntityManager.find
        .mockResolvedValueOnce([revokedToken]) // initial family lookup
        .mockResolvedValueOnce([revokedToken]); // revokeFamilyTokens lookup

      mockedArgon2.verify.mockResolvedValueOnce(true);

      await expect(service.refresh(rawToken)).rejects.toThrow(UnauthorizedException);
    });

    it('throws on expired refresh token', async () => {
      const familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const rawToken = `${familyId}.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`;
      const expiredToken = makeRefreshToken({
        familyId,
        expiresAt: new Date(Date.now() - 1000),
      });

      mockEntityManager.find.mockResolvedValueOnce([expiredToken]);
      mockedArgon2.verify.mockResolvedValueOnce(true);

      await expect(service.refresh(rawToken)).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token family does not exist', async () => {
      const rawToken = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      mockEntityManager.find.mockResolvedValueOnce([]);

      await expect(service.refresh(rawToken)).rejects.toThrow(UnauthorizedException);
    });

    it('throws for malformed token format', async () => {
      await expect(service.refresh('not-a-valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('revokes the matching token', async () => {
      const familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const rawToken = `${familyId}.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`;
      const activeToken = makeRefreshToken({ familyId });

      mockEntityManager.find.mockResolvedValueOnce([activeToken]);
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.logout(rawToken);

      expect(activeToken.revokedAt).toBeInstanceOf(Date);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('does nothing for empty token', async () => {
      await service.logout('');
      expect(mockEntityManager.find).not.toHaveBeenCalled();
    });
  });

  // ─── changePassword ──────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('updates password hash and revokes all tokens', async () => {
      const user = makeUser();
      mockUsersService.findById.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockedArgon2.hash.mockResolvedValueOnce('new-hashed-password');
      mockEntityManager.flush.mockResolvedValue(undefined);
      // transactional for revokeAllUserTokens
      mockEntityManager.find.mockResolvedValueOnce([makeRefreshToken()]);

      await service.changePassword(user.id, 'old-password', 'new-secure-password');

      expect(user.passwordHash).toBe('new-hashed-password');
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws when current password is wrong', async () => {
      const user = makeUser();
      mockUsersService.findById.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(false);

      await expect(
        service.changePassword(user.id, 'wrong-password', 'new-secure-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when new password is same as current', async () => {
      const user = makeUser();
      mockUsersService.findById.mockResolvedValueOnce(user);
      mockedArgon2.verify.mockResolvedValueOnce(true);

      await expect(
        service.changePassword(user.id, 'same-password', 'same-password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when user not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);

      await expect(service.changePassword('nonexistent', 'any', 'new-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
