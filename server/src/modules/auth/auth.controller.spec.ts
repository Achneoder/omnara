import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as typeof import('cookie-parser').default;
import { Server } from 'http';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth.guard.js';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  refresh: jest.fn(),
  changePassword: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

// A guard that always passes and injects a fake user payload
class MockJwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    req.user = {
      sub: 'user-uuid',
      email: 'test@example.com',
      role: 'editor',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };
    return true;
  }
}

describe('AuthController (integration)', () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'NODE_ENV') return 'test';
      if (key === 'REFRESH_TOKEN_EXPIRY_DAYS') return 7;
      return fallback;
    });
    mockConfigService.getOrThrow.mockReturnValue('test-secret');

    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtAuthGuard, useClass: MockJwtAuthGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('returns 200 with accessToken and sets refresh_token cookie', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        accessToken: 'access.jwt.token',
        refreshToken: 'family-id.random-part',
        user: { id: 'user-uuid', email: 'test@example.com', role: 'editor' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: 'access.jwt.token',
        user: { id: 'user-uuid', email: 'test@example.com', role: 'editor' },
      });
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 on bad credentials', async () => {
      const { UnauthorizedException } = await import('@nestjs/common');
      mockAuthService.login.mockRejectedValueOnce(new UnauthorizedException('Invalid credentials'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);
    });

    it('returns 400 on missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('returns 400 on invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });
  });

  // ─── GET /auth/me ─────────────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    it('returns current user info when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer valid.token')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'user-uuid',
        email: 'test@example.com',
        role: 'editor',
      });
    });
  });

  // ─── POST /auth/refresh ───────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('returns 401 when no refresh cookie is present', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('returns 200 and new accessToken with valid cookie', async () => {
      mockAuthService.refresh.mockResolvedValueOnce({
        accessToken: 'new.access.token',
        refreshToken: 'new-family.new-random',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=some-family.some-random')
        .expect(200);

      expect(response.body).toMatchObject({ accessToken: 'new.access.token' });
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('returns 204 and clears cookie', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid.token')
        .set('Cookie', 'refresh_token=some-family.some-random')
        .expect(204);
    });
  });

  // ─── POST /auth/change-password ───────────────────────────────────────────

  describe('POST /auth/change-password', () => {
    it('returns 204 on success', async () => {
      mockAuthService.changePassword.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid.token')
        .send({ currentPassword: 'old-pass', newPassword: 'new-secure-pass' })
        .expect(204);
    });

    it('returns 400 when newPassword is too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer valid.token')
        .send({ currentPassword: 'old-pass', newPassword: 'short' })
        .expect(400);
    });
  });
});
