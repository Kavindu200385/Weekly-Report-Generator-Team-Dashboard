import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  // Only required once the account has crossed the failed-attempt
  // threshold (see AuthService.login) — normal logins don't need it.
  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}
