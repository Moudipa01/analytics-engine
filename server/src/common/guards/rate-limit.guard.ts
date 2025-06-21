import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest(); // ✅ Explicit typing
    try {
      await limiter.consume(req.ip ?? 'unknown');
      return true;
    } catch {
      throw new BadRequestException('Too many requests'); // Or TooManyRequestsException if available
    }
  }
}
