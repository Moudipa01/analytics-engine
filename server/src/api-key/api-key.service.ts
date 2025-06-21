import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async issue(appName: string, ownerEmail: string) {
    const app = await this.prisma.app.upsert({
      where: { ownerEmail },
      update: {},
      create: {
        name: appName,
        ownerEmail,
      },
    });

    // 2️⃣ Generate raw key and hash
    const rawKey = randomBytes(32).toString('hex'); // returned to client ONCE
    const keyHash = await bcrypt.hash(rawKey, 10);

    // 3️⃣ Save hashed key
    await this.prisma.apiKey.create({
      data: {
        appId: app.id,
        keyHash,
        expiresAt: null, // or new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
      },
    });

    // 4️⃣ Return raw key once
    return {
      appId: app.id,
      apiKey: rawKey,
    };
  }
}
