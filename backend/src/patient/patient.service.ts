import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Patient name must be unique');
    const patient = this.patientRepo.create(dto);
    try {
      return await this.patientRepo.save(patient);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE')) {
        throw new BadRequestException('Patient name must be unique');
      }
      throw err;
    }
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepo.find();
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: number, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    if (dto.name && dto.name !== patient.name) {
      const existing = await this.patientRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new BadRequestException('Patient name must be unique');
    }
    Object.assign(patient, dto);
    try {
      return await this.patientRepo.save(patient);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE')) {
        throw new BadRequestException('Patient name must be unique');
      }
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepo.remove(patient);
  }
} 