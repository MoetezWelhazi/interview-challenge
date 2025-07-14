import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, ParseIntPipe } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Controller('medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  async create(@Body() dto: CreateMedicationDto) {
    return this.medicationService.create(dto);
  }

  @Get()
  async findAll() {
    return this.medicationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicationService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicationDto) {
    return this.medicationService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.medicationService.remove(id);
    return { message: 'Medication deleted' };
  }
} 