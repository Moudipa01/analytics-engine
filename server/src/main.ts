import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector, HttpAdapterHost } from '@nestjs/core';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { GlobalCacheInterceptor } from './common/interceptors/global-cache.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Unified Analytics API')
    .setDescription('API for event collection, key management & analytics')
    .setVersion('1.0')
    .addTag('analytics')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const cacheManager: Cache = app.get(CACHE_MANAGER);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(
    new GlobalCacheInterceptor(cacheManager, httpAdapterHost, reflector),
  );

  const rateLimitGuard: RateLimitGuard = app.get(RateLimitGuard);
  app.useGlobalGuards(rateLimitGuard);

  await app.listen(3000);
}
bootstrap();
