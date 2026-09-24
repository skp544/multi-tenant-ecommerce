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
  TwoFactorTokenPayload,
} from './types/jwt-payload.types.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { EmailService } from '../email/email.service.js';
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_MINUTES,
} from '../constants/otp.constants.js';

export interface LoginContext {
  ipAddress?: string;
}
@Injectable()
export class AuthService {
  // Same cost (10) as the real password hashes
  private readonly dummyPasswordHash = bcrypt.hashSync(
    'not-a-real-password',
    10,
  );

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

    // same message and same cost as a wrong password, so emails can't be
    // enumerated by the response or by the timing
    if (!user) {
      await bcrypt.compare(loginDto.password, this.dummyPasswordHash);
      throw new BadRequestException('Invalid email or password.');
    }

    // check password
    await this.checkPasswordMatchWithHash(user, loginDto.password);

    // check status User active or not, after the password so it isn't leaked
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active.');
    }

    // 2FA Enabled, the tokens are issued after the otp is verified

    if (user.twoFactorEnabled) {
      const result = await this.twoFactorCreateOtpToken(user.id);

      return {
        requiredTwoFactor: true,
        twoFactorToken: result.twoFactorToken,
        message: result?.message || '',
      };
    }

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

  async send2FAOtp(userId: string) {
    // Checking user exists

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Blocking repeated requests

    const recentOtp = await this.findRecentOtp(user.id);

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

  async verify2FAOtp(userId: string, otp: string, enable: boolean) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.twoFactorEnabled === enable) {
      throw new BadRequestException(
        `Two-factor authentication is already ${enable ? 'enabled' : 'disabled'}.`,
      );
    }

    const otpRecord = await this.findValidOtp(user.id, otp);

    // The otp is single use, so removing it along with the 2fa update
    await this.prisma.$transaction([
      this.prisma.twoFactorOtp.delete({
        where: {
          id: otpRecord.id,
        },
      }),
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorEnabled: enable,
        },
      }),
    ]);
  }

  private async findValidOtp(userId: string, otp: string) {
    const otpRecord = await this.prisma.twoFactorOtp.findFirst({
      where: {
        userId,
        verifiedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP expired or invalid');
    }

    // Counting every attempt up front so parallel requests can't bypass the limit
    const { attempts } = await this.prisma.twoFactorOtp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (attempts > OTP_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many invalid attempts. Please request a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }

    return otpRecord;
  }

  // second step of the login, verifying the otp sent by the login

  async verifyLogin2FA(
    twoFactorToken: string,
    otp: string,
    context: LoginContext = {},
  ) {
    let decoded: TwoFactorTokenPayload;

    try {
      decoded = this.jwt.verify<TwoFactorTokenPayload>(twoFactorToken, {
        secret: this.config.getOrThrow<string>('JWT_2FA_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Two-factor session expired.');
    }

    const user = await this.usersService.findById(decoded.userId);

    if (!user || user.status !== UserStatus.ACTIVE || !user.twoFactorEnabled) {
      throw new UnauthorizedException('Two-factor session expired.');
    }

    const otpRecord = await this.findValidOtp(user.id, otp);

    // The otp is single use
    await this.prisma.twoFactorOtp.delete({ where: { id: otpRecord.id } });

    const token = await this.issueTokenPair(user, context);

    return { ...token, userType: user.userType };
  }

  // at the time of login sending the otp

  async twoFactorCreateOtpToken(userId: string) {
    const twoFactorTokenPayload: TwoFactorTokenPayload = { userId };

    const twoFactorToken = this.jwt.sign(twoFactorTokenPayload, {
      secret: this.config.getOrThrow<string>('JWT_2FA_SECRET'),
      expiresIn: this.config.get('JWT_2FA_EXPIRES_IN', '15m'),
    });

    // A new otp resets the attempt limit, so inside the cooldown the earlier
    // one stays valid instead of sending another
    if (await this.findRecentOtp(userId)) {
      return {
        twoFactorToken,
        message: 'A code was already sent to your email. Please use it.',
      };
    }

    await this.send2FAOtp(userId);

    return {
      twoFactorToken,
      message: 'OTP sent successfully!',
    };
  }

  private findRecentOtp(userId: string) {
    return this.prisma.twoFactorOtp.findFirst({
      where: {
        userId,
        createdAt: {
          gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
    });
  }
}
