import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class UpdateAssignmentDto {
  @IsInt()
  @IsOptional()
  patientId?: number;

  @IsInt()
  @IsOptional()
  medicationId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsInt()
  @IsOptional()
  days?: number;
} 