import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import type { RequiredEntityData } from '@mikro-orm/core';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from '../users/entities/refresh-token.entity.js';
import { JwtPayload } from './guards/jwt-auth.guard.js';

const ACCOUNT_LOCKOUT_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Used for timing-safe verification when user is not found — prevents user enumeration
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHRzZWVk$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
  }> {
    const user = await this.usersService.findByEmail(email);

    // Always run Argon2 verify to prevent timing-based user enumeration
    const hashToVerify = user?.passwordHash ?? DUMMY_HASH;
    const passwordValid = await argon2.verify(hashToVerify, password);

    if (!user || !passwordValid) {
      if (user) {
        await this.recordFailedAttempt(user);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(`Account locked until ${user.lockedUntil.toISOString()}`);
    }

    // Clear lockout state on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil !== null) {
      await this.usersService.updateFailedAttempts(user, 0, null);
    }

    const { accessToken, refreshToken } = await this.issueTokenPair(user, uuidv4());

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refresh(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Argon2 hashes are non-deterministic so we can't query by hash directly.
    // The raw token format is "<familyId>.<random>" — we query by familyId, then
    // verify each candidate with argon2.verify (timing-safe).
    // Architecture: the raw token format is "<familyId>.<random>" so we can query by familyId
    const parts = rawRefreshToken.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid refresh token format');
    }
    const [familyId] = parts;

    // Fetch all tokens for this family (typically 1 active + revoked history)
    const familyTokens = await this.em.find(RefreshToken, { familyId }, { populate: ['user'] });

    if (familyTokens.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the token that matches via timing-safe comparison
    let matchedToken: RefreshToken | null = null;
    for (const token of familyTokens) {
      const matches = await argon2.verify(token.tokenHash, rawRefreshToken);
      if (matches) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Theft detection: if a revoked token in this family is being reused, revoke the whole family
    if (matchedToken.revokedAt !== null) {
      await this.revokeFamilyTokens(familyId);
      throw new UnauthorizedException('Refresh token reuse detected — all sessions invalidated');
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = matchedToken.user;

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Rotate: revoke old, issue new in same family
    await this.em.transactional(async (em) => {
      matchedToken!.revokedAt = new Date();
      em.persist(matchedToken!);
    });

    const { accessToken, refreshToken } = await this.issueTokenPair(user, familyId);

    return { accessToken, refreshToken };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const parts = rawRefreshToken.split('.');
    if (parts.length !== 2) {
      return;
    }
    const [familyId] = parts;

    const familyTokens = await this.em.find(RefreshToken, { familyId, revokedAt: null });

    for (const token of familyTokens) {
      const matches = await argon2.verify(token.tokenHash, rawRefreshToken);
      if (matches) {
        token.revokedAt = new Date();
        await this.em.flush();
        return;
      }
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must differ from current password');
    }

    user.passwordHash = await argon2.hash(newPassword);
    await this.em.flush();

    // Revoke all existing refresh tokens to force re-login on other devices
    await this.revokeAllUserTokens(userId);
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async issueTokenPair(
    user: User,
    familyId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    // ConfigService returns string but signAsync expects ms.StringValue — runtime value is always a valid ms string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiresIn = this.configService.get<string>('JWT_EXPIRY', '15m') as any;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    const rawToken = `${familyId}.${uuidv4()}`;
    const tokenHash = await argon2.hash(rawToken);

    const expiryDays = this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    this.em.create(RefreshToken, {
      user,
      tokenHash,
      familyId,
      expiresAt,
    } as RequiredEntityData<RefreshToken>);

    await this.em.flush();

    return { accessToken, refreshToken: rawToken };
  }

  private async recordFailedAttempt(user: User): Promise<void> {
    const newCount = user.failedLoginAttempts + 1;
    const lockedUntil =
      newCount >= ACCOUNT_LOCKOUT_ATTEMPTS
        ? new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS)
        : user.lockedUntil;
    await this.usersService.updateFailedAttempts(user, newCount, lockedUntil);
  }

  private async revokeFamilyTokens(familyId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const tokens = await em.find(RefreshToken, { familyId, revokedAt: null });
      const now = new Date();
      for (const token of tokens) {
        token.revokedAt = now;
      }
    });
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const tokens = await em.find(RefreshToken, {
        user: { id: userId },
        revokedAt: null,
      });
      const now = new Date();
      for (const token of tokens) {
        token.revokedAt = now;
      }
    });
  }
}
