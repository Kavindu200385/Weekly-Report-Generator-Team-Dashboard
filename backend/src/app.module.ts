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
import { testDatabaseName } from './database/data-source';

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
        // The e2e suite spawns real `nest start` processes with
        // NODE_ENV=test — route those at a separate database so running
        // tests never creates throwaway accounts/reports in real dev data.
        database: process.env.NODE_ENV === 'test' ? testDatabaseName : config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // DEV ONLY — never true in production, switch to migrations before deploying
        synchronize: true,
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
