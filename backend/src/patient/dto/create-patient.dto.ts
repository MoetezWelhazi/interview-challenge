import { IsString, IsNotEmpty, IsDateString, IsNotIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotFutureDate } from './future-date.validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsDateString()
  @IsNotIn([''])
  @IsNotFutureDate()
  dateOfBirth: string;
} 