import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './assignment.entity';
import { Patient } from '../patient/patient.entity';
import { Medication } from '../medication/medication.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { calculateRemainingDays } from './assignment.util';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,
  ) {}

  async create(dto: CreateAssignmentDto): Promise<Assignment> {
    const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
    if (!patient) throw new BadRequestException('Invalid patientId');
    const medication = await this.medicationRepo.findOne({ where: { id: dto.medicationId } });
    if (!medication) throw new BadRequestException('Invalid medicationId');
    const assignment = this.assignmentRepo.create({
      patient,
      medication,
      startDate: dto.startDate,
      days: dto.days,
    });
    return this.assignmentRepo.save(assignment);
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepo.find();
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: number, dto: UpdateAssignmentDto): Promise<any> {
    const assignment = await this.findOne(id);
    if (dto.patientId) {
      const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
      if (!patient) throw new BadRequestException('Invalid patientId');
      assignment.patient = patient;
    }
    if (dto.medicationId) {
      const medication = await this.medicationRepo.findOne({ where: { id: dto.medicationId } });
      if (!medication) throw new BadRequestException('Invalid medicationId');
      assignment.medication = medication;
    }
    if (dto.startDate) assignment.startDate = dto.startDate;
    if (dto.days !== undefined) assignment.days = dto.days;
    const updated = await this.assignmentRepo.save(assignment);
    return {
      id: updated.id,
      patientId: updated.patient.id,
      medicationId: updated.medication.id,
      startDate: updated.startDate,
      days: updated.days,
    };
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.findOne(id);
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assignmentRepo.remove(assignment);
  }

  async findByPatient(patientId: number): Promise<Assignment[]> {
    return this.assignmentRepo.find({ where: { patient: { id: patientId } } });
  }

  async getRemainingDaysForPatientAssignments(patientId: number): Promise<any[]> {
    const assignments = await this.findByPatient(patientId);
    return assignments.map(a => ({
      ...a,
      remainingDays: calculateRemainingDays(a.startDate, a.days),
    }));
  }
} 