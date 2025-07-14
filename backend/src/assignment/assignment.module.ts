import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './assignment.entity';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { Patient } from '../patient/patient.entity';
import { Medication } from '../medication/medication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Patient, Medication])],
  providers: [AssignmentService],
  controllers: [AssignmentController],
  exports: [AssignmentService],
})
export class AssignmentModule {} 