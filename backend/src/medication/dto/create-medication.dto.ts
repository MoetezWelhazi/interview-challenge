import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  dosage: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  frequency: string;
} 