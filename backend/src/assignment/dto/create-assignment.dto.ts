import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';

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
  days: number;
} 