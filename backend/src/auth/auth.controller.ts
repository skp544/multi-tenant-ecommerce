import {
  Controller,
  Post,
  Get,
  Body,
  Ip,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtAccessPayload } from './types/jwt-payload.types.js';
import { RefreshDTO } from './dto/refresht.dto.js';
import { Verify2faOtpDto } from './dto/verify-2fa-otp.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login') // /auth/login
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDTO, @Ip() ipAddress: string) {
    const data = await this.authService.login(loginDto, { ipAddress });
    return { data, message: 'Logged in successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me') // /auth/me
  async me(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.authService.me(user.userId);
    return data;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDTO, @Ip() ipAddress: string) {
    return this.authService.refresh(dto.refreshToken, { ipAddress });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtAccessPayload) {
    await this.authService.revokeSession(user.userId, user.sid);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa-generate-otp')
  @HttpCode(HttpStatus.OK)
  async send2FAOtp(@CurrentUser() user: JwtAccessPayload) {
    await this.authService.send2FAOtp(user.userId);

    return { message: 'OTP sent successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa-verify-otp')
  @HttpCode(HttpStatus.OK)
  async verify2FAOtp(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: Verify2faOtpDto,
  ) {
    await this.authService.verify2FAOtp(user.userId, dto.otp, dto.enable);

    return {
      message: `Two-factor authentication ${dto.enable ? 'enabled' : 'disabled'} successfully`,
    };
  }
}
