import { PrismaService } from '../prisma/prisma.service';
export declare class ApiKeyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    issue(appName: string, ownerEmail: string): Promise<{
        appId: string;
        apiKey: string;
    }>;
}
