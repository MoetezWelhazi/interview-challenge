import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,
  ) {}

  async create(dto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationRepo.create(dto);
    return this.medicationRepo.save(medication);
  }

  async findAll(): Promise<Medication[]> {
    return this.medicationRepo.find();
  }

  async findOne(id: number): Promise<Medication> {
    const medication = await this.medicationRepo.findOne({ where: { id } });
    if (!medication) throw new NotFoundException('Medication not found');
    return medication;
  }

  async update(id: number, dto: UpdateMedicationDto): Promise<Medication> {
    const medication = await this.findOne(id);
    Object.assign(medication, dto);
    return this.medicationRepo.save(medication);
  }

  async remove(id: number): Promise<void> {
    const medication = await this.findOne(id);
    await this.medicationRepo.remove(medication);
  }
} 