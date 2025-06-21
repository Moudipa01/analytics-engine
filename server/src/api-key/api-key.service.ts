import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Issues a new API key with a 1-year expiration.
   */
  async issue(appName: string, ownerEmail: string) {
    const app = await this.prisma.app.upsert({
      where: { ownerEmail },
      update: {},
      create: { name: appName, ownerEmail },
    });

    // Generate raw API key and its secure hash
    const rawKey = randomBytes(32).toString('hex');
    const keyHash = await bcrypt.hash(rawKey, 10);

    // Set expiration date to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Save hashed key with expiration
    await this.prisma.apiKey.create({
      data: {
        appId: app.id,
        keyHash,
        expiresAt,
        revoked: false,
      },
    });

    return {
      appId: app.id,
      apiKey: rawKey, // returned only once
    };
  }

  /**
   * Returns the latest valid API key metadata for an app.
   */
  async getApiKey(appId: string) {
    return this.prisma.apiKey.findFirst({
      where: {
        appId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Revokes all API key records matching the given raw key.
   */
  async revokeApiKey(apiKey: string) {
    // Find matching key
    const allKeys = await this.prisma.apiKey.findMany();

    // Compare hash against stored keys
    for (const storedKey of allKeys) {
      const match = await bcrypt.compare(apiKey, storedKey.keyHash);
      if (match) {
        await this.prisma.apiKey.update({
          where: { id: storedKey.id },
          data: { revoked: true },
        });
        return { message: 'API key revoked successfully' };
      }
    }

    throw new NotFoundException('API key not found');
  }

  /**
   * Validates whether an API key is active and not expired or revoked.
   */
  async validateApiKey(apiKey: string) {
    const allKeys = await this.prisma.apiKey.findMany({
      where: { revoked: false },
    });

    for (const key of allKeys) {
      const isMatch = await bcrypt.compare(apiKey, key.keyHash);
      if (isMatch) {
        if (!key.expiresAt || new Date() <= key.expiresAt) {
          return key; // valid key object
        }
        break;
      }
    }

    throw new UnauthorizedException('Invalid or expired API key');
  }
}
