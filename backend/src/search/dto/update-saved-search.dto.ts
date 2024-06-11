import { ApiProperty } from '@nestjs/swagger';
import { MonitoringFrequency } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSavedSearchDto {
  @IsString()
  name: string;

  @IsEnum(MonitoringFrequency)
  @ApiProperty({
    enum: MonitoringFrequency,
  })
  @IsOptional()
  monitoringFrequency?: MonitoringFrequency;

  @IsBoolean()
  isMonitored: boolean;
}
