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
  async storeEvent(dto: CollectDto, appId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.prisma.event.create({
      data: {
        appId,
        event: dto.event,
        url: dto.url,
        referrer: dto.referrer,
        device: dto.device,
        ipAddress: dto.ipAddress,
        timestamp: new Date(dto.timestamp),
        metadata: dto.metadata ?? {},
        userId: dto.userId ?? null,
      },
    });
  }
  /**
   * Public-facing event summary with 60s cache.
   */
  async getEventSummary(params: {
    appId: string;
    event: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    event: string;
    count: number;
    uniqueUsers: number;
    deviceData: Record<string, number>;
  }> {
    const { appId, event, startDate, endDate } = params;
    const cacheKey = `summary:${event}:${appId}:${startDate ?? 'null'}:${endDate ?? 'null'}`;
    const cached = await this.cacheManager.get<{
      event: string;
      count: number;
      uniqueUsers: number;
      deviceData: Record<string, number>;
    }>(cacheKey);
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

  private async buildSummary(params: {
    appId: string;
    event: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    event: string;
    count: number;
    uniqueUsers: number;
    deviceData: Record<string, number>;
  }> {
    const { appId, event, startDate, endDate } = params;

    const where: Prisma.EventWhereInput = {
      appId,
      event,
      timestamp:
        startDate || endDate
          ? {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            }
          : undefined,
    };

    const results = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      this.prisma.event.count({ where }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.prisma.event.findMany({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where,
        distinct: ['userId'],
        select: { userId: true },
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.prisma.event.groupBy({
        by: ['device'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where,
        _count: { device: true },
      }),
    ]);
    const totalCount = results[0] as number;
    const uniqueUsersList = results[1] as Array<{ userId: string | null }>;
    const deviceCounts = results[2] as Array<{
      device: string | null;
      _count: { device: number };
    }>;

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

  async getUserStats(userId: string): Promise<{
    userId: string;
    totalEvents: number;
    deviceDetails: {
      browser?: string;
      os?: string;
    };
    ipAddress?: string;
    recentEvents: any[];
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const events = await this.prisma.event.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const totalEvents = await this.prisma.event.count({
      where: { userId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const last = events[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const metadata = (last?.metadata ?? undefined) as EventMetadata | undefined;

    return {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      totalEvents,
      deviceDetails: {
        browser: metadata?.browser,
        os: metadata?.os,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ipAddress: last?.ipAddress ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      recentEvents: events,
    };
  }
}
