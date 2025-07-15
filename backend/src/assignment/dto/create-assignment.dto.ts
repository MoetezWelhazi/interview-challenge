import { IsInt, IsNotEmpty, IsDateString, Min, IsPositive } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsInt()
  @IsNotEmpty()
  medicationId: number;

  @IsDateString()
  startDate: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  days: number;
} 