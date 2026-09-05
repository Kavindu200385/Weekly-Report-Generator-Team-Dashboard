import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '3306', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Defaults to false (safe for production). Set DB_SYNCHRONIZE=true
        // only for a first deploy against a brand-new empty database, then
        // flip it back off — this repo has no migration files yet.
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    AuthModule,
    ProjectsModule,
    ReportsModule,
    ReviewsModule,
    UsersModule,
    DashboardModule,
    AiChatModule,
  ],
  controllers: [AppController],
  providers: [
    // Order matters: JwtAuthGuard populates req.user (or throws 401) before
    // RolesGuard reads req.user.role. Routes marked @Public() skip both.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
