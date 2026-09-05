import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
