import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { type JwtAccessPayload } from '../auth/types/jwt-payload.types.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put('/me')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: UpdateUserDto,
  ) {
    const response = await this.usersService.update(user.userId, dto);

    return { data: response, message: 'User updated successfully' };
  }
}
