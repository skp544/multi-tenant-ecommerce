import { Controller, Post, Body, Ip } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login') // /auth/login
  login(@Body() loginDto: LoginDTO, @Ip() ipAddress: string) {
    return this.authService.login(loginDto, { ipAddress });
  }
}
