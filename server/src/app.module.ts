import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import type { RedisStore } from 'cache-manager-ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiKeyModule } from './api-key/api-key.module';
import { PrismaModule } from './prisma/prisma.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore as unknown as RedisStore,
      host: 'redis',
      port: 6379,
      ttl: 60, // seconds
    }),
    ApiKeyModule,
    PrismaModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, RateLimitGuard],
})
export class AppModule {}
