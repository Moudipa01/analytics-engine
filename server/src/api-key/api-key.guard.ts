import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader || typeof apiKeyHeader !== 'string') {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    // Fetch all valid keys from the DB
    const allKeys = await this.prisma.apiKey.findMany({
      where: {
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        app: true,
      },
    });

    for (const dbKey of allKeys) {
      const isMatch = await bcrypt.compare(apiKeyHeader, dbKey.keyHash);
      if (isMatch) {
        (request as any).appInfo = dbKey.app;
        return true;
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
