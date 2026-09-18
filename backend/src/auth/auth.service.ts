import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
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
import { randomInt } from 'node:crypto';
import { EmailService } from '../email/email.service.js';
import {
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_MINUTES,
} from '../constants/otp.constants.js';


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
    private readonly emailService: EmailService,
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

    // check password
    await this.checkPasswordMatchWithHash(user, loginDto.password);

    const token = await this.issueTokenPair(user, context);

    // access token and refresh token
    return { ...token, userType: user.userType };
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

  private async checkPasswordMatchWithHash(
    user: User,
    password: string,
  ): Promise<void> {
    const hash = user?.passwordHash;

    const matches = await bcrypt.compare(password, hash);

    if (!matches) {
      throw new BadRequestException('Invalid email or password.');
    }
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('Account not found.');
    }

    const {
      passwordHash: _passwordHash,
      twoFactorSecret: _twoFactorSecret,
      ...safeUser
    } = user;

    return safeUser;
  }

  async refresh(refreshToken: string, context: LoginContext = {}) {
    const decoded = this.verifyRefreshToken(refreshToken);

    const session = await this.prisma.userSession.findUnique({
      where: {
        id: decoded.sessionId,
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired.');
    }

    const matches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.usersService.findById(decoded.userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found.');
    }

    await this.prisma.userSession.update({
      where: {
        id: session.id,
      },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(user, {
      ipAddress: context?.ipAddress,
    });
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      return this.jwt.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.userSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session || session.userId !== userId) {
      throw new BadRequestException('Session not found.');
    }

    await this.prisma.userSession.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async sendEnable2FAOtp(userId: string) {
    // Checking user exists

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled.',
      );
    }

    // Blocking repeated requests

    const recentOtp = await this.prisma.twoFactorOtp.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
    });

    if (recentOtp) {
      throw new HttpException(
        `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generating otp

    const generateOtp = randomInt(100000, 1_000_000).toString();

    const otpHash = await bcrypt.hash(generateOtp, 10);

    const expiredAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Only the latest otp should be valid
    await this.prisma.twoFactorOtp.deleteMany({
      where: { userId: user.id, verifiedAt: null },
    });

    const otpRecord = await this.prisma.twoFactorOtp.create({
      data: {
        userId: user.id,
        otpHash: otpHash,
        expiresAt: expiredAt,
      },
    });

    try {
      await this.emailService.sendOTP2FA(
        user.fullName,
        user.email,
        generateOtp,
        `${OTP_TTL_MINUTES} minutes`,
      );
    } catch (error) {
      // Removing the unused otp so the user can retry without waiting
      await this.prisma.twoFactorOtp.delete({ where: { id: otpRecord.id } });
      throw error;
    }
  }
}
