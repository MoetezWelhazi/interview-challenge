import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from '../patient/patient.entity';
import { Medication } from '../medication/medication.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, patient => patient.assignments, { eager: true, onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => Medication, medication => medication.assignments, { eager: true, onDelete: 'CASCADE' })
  medication: Medication;

  @Column()
  startDate: string; // ISO string

  @Column()
  days: number;
} 