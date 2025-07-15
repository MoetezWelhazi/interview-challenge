import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const existing = await this.medicationRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Medication name must be unique');
    const medication = this.medicationRepo.create(dto);
    try {
      return await this.medicationRepo.save(medication);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE')) {
        throw new BadRequestException('Medication name must be unique');
      }
      throw err;
    }
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
    if (dto.name && dto.name !== medication.name) {
      const existing = await this.medicationRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new BadRequestException('Medication name must be unique');
    }
    Object.assign(medication, dto);
    try {
      return await this.medicationRepo.save(medication);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE')) {
        throw new BadRequestException('Medication name must be unique');
      }
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    const medication = await this.findOne(id);
    await this.medicationRepo.remove(medication);
  }
} 