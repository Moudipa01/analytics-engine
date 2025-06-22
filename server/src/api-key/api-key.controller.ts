import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('register')
  async register(
    @Body('appName') appName: string,
    @Body('email') email: string,
  ) {
    return this.apiKeyService.issue(appName, email);
  }
  @Get()
  async getApiKey(@Query('appId') appId: string) {
    return this.apiKeyService.getApiKey(appId);
  }
  @Post('revoke')
  async revokeApiKey(@Body('apiKey') apiKey: string) {
    return this.apiKeyService.revokeApiKey(apiKey);
  }
}
