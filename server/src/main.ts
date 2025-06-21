import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

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

  const cacheManager = app.get<Cache>(CACHE_MANAGER);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new CacheInterceptor(cacheManager, reflector));

  const rateLimitGuard: RateLimitGuard = app.get(RateLimitGuard); // ✅ Fix: Add explicit type
  app.useGlobalGuards(rateLimitGuard);

  await app.listen(3000);
}
bootstrap();
