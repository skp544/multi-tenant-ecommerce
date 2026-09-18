import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2faOtpDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
