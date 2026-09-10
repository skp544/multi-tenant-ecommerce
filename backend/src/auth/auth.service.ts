import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LoginDTO } from './dto/login.dto.js';
import { UsersService } from '../users/users.service.js';
import { UserStatus } from '../generated/prisma/enums.js';
import { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  JwtAccessPayload,
  RefreshTokenPayload,
} from './types/jwt-payload.types.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

export interface LoginContext {
  ipAddress?: string;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async login(loginDto: LoginDTO, context: LoginContext = {}) {
    // check user exists in db
    const user = await this.usersService.findByEmail(loginDto.email);

    // check status User active or not
    if (!user) {
      throw new BadRequestException('Account not found with this email.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active.');
    }

    const token = await this.issueTokenPair(user, context);

    // access token and refresh token
    return { ...token, user_type: user.userType };
  }

  async issueTokenPair(user: User, context: LoginContext = {}) {
    // Refresh token expires at 30d
    const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // session

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        deviceLabel: 'Untitled',
        ipAddress: context.ipAddress ?? '',
        refreshTokenHash: '',
        expiresAt: expiredAt,
      },
    });

    const accessTokenPayload: JwtAccessPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      sid: session.id,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      sessionId: session.id,
    };

    // Create token

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.sign(accessTokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwt.sign(refreshTokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Update in DB

    await this.prisma.userSession.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: refreshTokenHash,
      },
    });

    // session refresh token

    return {
      accessToken,
      refreshToken,
    };
  }
}
