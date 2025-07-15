import { IsInt, IsOptional, IsDateString, Min, IsPositive } from 'class-validator';

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
  @IsPositive()
  @Min(1)
  @IsOptional()
  days?: number;
} 