"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async storeEvent(dto, appId) {
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
    async getEventSummary({ appId, event, startDate, endDate, }) {
        const where = {
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
                _count: {
                    device: true,
                },
            }),
        ]);
        const deviceData = {};
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map