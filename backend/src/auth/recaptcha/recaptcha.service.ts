import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
  constructor(private readonly config: ConfigService) {}

  async verifyToken(token: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    const secret = this.config.get<string>('RECAPTCHA_SECRET_KEY');
    const { data } = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret, response: token } },
    );

    return Boolean(data?.success);
  }
}
