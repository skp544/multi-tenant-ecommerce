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
    console.log(user);
    const data = await this.authService.inme(user.userId);
    return data;
  }
}
