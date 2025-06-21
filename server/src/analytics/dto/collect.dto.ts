import { IsString, IsOptional, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectDto {
  @ApiProperty({
    description: 'The type of event (e.g. signup_click, page_view)',
  })
  @IsString()
  event: string;

  @ApiPropertyOptional({ description: 'URL where the event occurred' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Referrer URL (if any)' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'Device type (e.g. mobile, desktop)' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({ description: 'IP address of the user' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'ISO timestamp of the event',
    example: '2024-06-21T12:00:00Z',
  })
  @IsISO8601()
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Additional metadata (user agent info, etc.)',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
