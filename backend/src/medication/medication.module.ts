import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medication } from './medication.entity';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medication])],
  providers: [MedicationService],
  controllers: [MedicationController],
  exports: [MedicationService],
})
export class MedicationModule {} 