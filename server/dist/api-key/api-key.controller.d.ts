import { ApiKeyService } from './api-key.service';
export declare class ApiKeyController {
    private readonly apiKeyService;
    constructor(apiKeyService: ApiKeyService);
    register(appName: string, email: string): Promise<{
        appId: string;
        apiKey: string;
    }>;
}
