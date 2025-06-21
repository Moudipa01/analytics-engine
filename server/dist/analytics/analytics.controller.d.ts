import { AnalyticsService } from './analytics.service';
import { CollectDto } from './dto/collect.dto';
import { Request } from 'express';
interface AppRequest extends Request {
    appInfo: {
        id: string;
        name: string;
        ownerEmail: string;
    };
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    collect(body: CollectDto, req: AppRequest): Promise<{
        message: string;
        appId: string;
    }>;
    getEventSummary(req: AppRequest, event: string, startDate?: string, endDate?: string): Promise<{
        event: string;
        count: number;
        uniqueUsers: number;
        deviceData: Record<string, number>;
    }>;
}
export {};
