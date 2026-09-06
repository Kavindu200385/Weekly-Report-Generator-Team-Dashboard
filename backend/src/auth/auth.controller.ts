import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';
import { PasswordResetsService } from '../users/password-resets.service';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetsService: PasswordResetsService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Get('recaptcha-required')
  async recaptchaRequired(@Query('email') email: string) {
    return { required: await this.authService.isRecaptchaRequired(email) };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout() {
    // Stateless JWT auth — there is no server-side session or refresh token
    // to invalidate. The client is responsible for discarding the token;
    // this endpoint exists only so the frontend has something to call.
    return { message: 'Logged out' };
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.passwordResetsService.requestReset(dto.email);
    // Always the same response, whether or not the email matched an
    // account — never reveal which emails have accounts.
    return { message: 'If that email exists, your manager has been notified.' };
  }

  @Public()
  @Get('reset-password/:token')
  async validateResetToken(@Param('token') token: string) {
    await this.passwordResetsService.findValidByToken(token);
    return { valid: true };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetsService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password reset. You can now sign in with your new password.' };
  }
}
