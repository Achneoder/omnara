import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ConfigService } from '@nestjs/config';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: { id: string; email: string; role: string } }> {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto.email,
      dto.password,
    );

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const rawToken: string | undefined = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];

    if (rawToken) {
      await this.authService.logout(rawToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth/refresh' });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const rawToken: string | undefined = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];

    if (!rawToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken } = await this.authService.refresh(rawToken);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload): { id: string; email: string; role: string } {
    return { id: user.sub, email: user.email, role: user.role };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
    // Clear the refresh cookie so the user re-authenticates
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth/refresh' });
  }

  private setRefreshCookie(res: Response, token: string): void {
    const expiryDays = this.configService.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7);
    const maxAgeMs = expiryDays * 24 * 60 * 60 * 1000;

    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      path: '/auth/refresh',
      maxAge: maxAgeMs,
    });
  }
}
