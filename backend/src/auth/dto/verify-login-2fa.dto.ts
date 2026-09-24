import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyLogin2faDto {
  @IsString()
  @IsNotEmpty()
  twoFactorToken: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
