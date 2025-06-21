import { Controller, Post, Body } from '@nestjs/common';
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
}
