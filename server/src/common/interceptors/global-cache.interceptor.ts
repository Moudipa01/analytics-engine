import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector, HttpAdapterHost } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Request } from 'express';

@Injectable()
export class GlobalCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    protected readonly httpAdapterHost: HttpAdapterHost,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;
    if (!httpAdapter) {
      return undefined;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = `${request.method}-${request.url}`;
    return key;
  }
}
