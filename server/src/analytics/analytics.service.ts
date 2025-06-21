import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CollectDto } from './dto/collect.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

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

      // ✅ use findMany + distinct + .length instead of count()
      this.prisma.event.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true },
      }),

      this.prisma.event.groupBy({
        by: ['device'],
        where,
        _count: {
          device: true,
        },
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
}
