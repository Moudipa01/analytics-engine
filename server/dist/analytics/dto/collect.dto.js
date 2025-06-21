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
exports.CollectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CollectDto {
    event;
    url;
    referrer;
    device;
    ipAddress;
    timestamp;
    metadata;
}
exports.CollectDto = CollectDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of event (e.g. signup_click, page_view)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "event", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL where the event occurred' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Referrer URL (if any)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "referrer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device type (e.g. mobile, desktop)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "device", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IP address of the user' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO timestamp of the event',
        example: '2024-06-21T12:00:00Z',
    }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], CollectDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata (user agent info, etc.)',
        type: 'object',
        additionalProperties: true,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CollectDto.prototype, "metadata", void 0);
//# sourceMappingURL=collect.dto.js.map