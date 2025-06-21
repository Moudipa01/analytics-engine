import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Get,
} from '@nestjs/common';
import { ApiKeyGuard } from '../api-key/api-key.guard';
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

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(ApiKeyGuard)
  @Post('collect')
  async collect(@Body() body: CollectDto, @Req() req: AppRequest) {
    console.log('API Key matched, app info:', req.appInfo);

    // ✅ Actually store the event!
    await this.analyticsService.storeEvent(body, req.appInfo.id);

    return {
      message: 'Event received',
      appId: req.appInfo.id,
    };
  }

  @UseGuards(ApiKeyGuard)
  @Get('event-summary')
  async getEventSummary(
    @Req() req: AppRequest,
    @Query('event') event: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getEventSummary({
      appId: req.appInfo.id,
      event,
      startDate,
      endDate,
    });
  }
}
