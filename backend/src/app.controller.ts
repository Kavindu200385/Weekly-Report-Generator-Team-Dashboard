import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      database: this.dataSource.isInitialized ? 'connected' : 'disconnected',
    };
  }
}
