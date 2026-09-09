import {
  Controller,
  Post,
  Body,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login') // /auth/login
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDTO, @Ip() ipAddress: string) {
    const data = await this.authService.login(loginDto, { ipAddress });
    return { data, message: 'Logged in successfully' };
  }
}
