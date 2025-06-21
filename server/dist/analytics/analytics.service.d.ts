import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CollectDto } from './dto/collect.dto';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    storeEvent(dto: CollectDto, appId: string): Promise<{
        event: string;
        id: bigint;
        createdAt: Date;
        appId: string;
        url: string | null;
        referrer: string | null;
        device: string | null;
        ipAddress: string | null;
        timestamp: Date;
        metadata: Prisma.JsonValue | null;
        userId: string | null;
    }>;
    getEventSummary({ appId, event, startDate, endDate, }: {
        appId: string;
        event: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        event: string;
        count: number;
        uniqueUsers: number;
        deviceData: Record<string, number>;
    }>;
}
