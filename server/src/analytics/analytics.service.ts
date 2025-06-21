import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CollectDto } from './dto/collect.dto';

interface EventMetadata {
  browser?: string;
  os?: string;
  [key: string]: unknown;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Store a single analytics event.
   */
  async storeEvent(dto: CollectDto, appId: string) {
    return this.prisma.event.create({
      data: {
        appId,
        event: dto.event,
        url: dto.url,
        referrer: dto.referrer,
        device: dto.device,
        ipAddress: dto.ipAddress,
        timestamp: new Date(dto.timestamp),
        metadata: dto.metadata ?? {},
      },
    });
  }

  /**
   * Public-facing event summary with 60s cache.
   */
  async getEventSummary({
    appId,
    event,
    startDate,
    endDate,
  }: {
    appId: string;
    event: string;
    startDate?: string;
    endDate?: string;
  }) {
    const cacheKey = `summary:${event}:${appId}:${startDate ?? 'null'}:${endDate ?? 'null'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const summary = await this.buildSummary({
      appId,
      event,
      startDate,
      endDate,
    });
    await this.cacheManager.set(cacheKey, summary, 60); // cache for 60 seconds
    return summary;
  }

  private async buildSummary({
    appId,
    event,
    startDate,
    endDate,
  }: {
    appId: string;
    event: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.EventWhereInput = {
      appId,
      event,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const [totalCount, uniqueUsersList, deviceCounts] = await Promise.all([
      this.prisma.event.count({ where }),

      this.prisma.event.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true },
      }),

      this.prisma.event.groupBy({
        by: ['device'],
        where,
        _count: { device: true },
      }),
    ]);

    const deviceData: Record<string, number> = {};
    deviceCounts.forEach((entry) => {
      const key = entry.device ?? 'unknown';
      deviceData[key] = entry._count.device;
    });

    return {
      event,
      count: totalCount,
      uniqueUsers: uniqueUsersList.length,
      deviceData,
    };
  }

  async getUserStats(userId: string) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const totalEvents = await this.prisma.event.count({
      where: { userId },
    });

    const last = events[0] ?? {};
    const metadata = last.metadata as EventMetadata | undefined;

    return {
      userId,
      totalEvents,
      deviceDetails: {
        browser: metadata?.browser,
        os: metadata?.os,
      },
      ipAddress: last.ipAddress,
      recentEvents: events,
    };
  }
}
