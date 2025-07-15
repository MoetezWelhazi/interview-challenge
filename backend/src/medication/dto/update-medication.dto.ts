import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMedicationDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  dosage?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  frequency?: string;
} 