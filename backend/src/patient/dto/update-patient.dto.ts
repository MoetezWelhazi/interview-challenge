import { IsString, IsOptional, IsDateString, IsNotIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotFutureDate } from './future-date.validator';

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsDateString()
  @IsOptional()
  @IsNotIn([''])
  @IsNotFutureDate()
  dateOfBirth?: string;
} 