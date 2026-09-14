import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  /* Find by user email */

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        profileImage: data?.profileImage,
      },
    });

    const { passwordHash, twoFactorSecret, ...rest } = user;

    return rest;
  }

  async changePassword(id: string, data: ChangePasswordDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
      },
    });
  }
}
