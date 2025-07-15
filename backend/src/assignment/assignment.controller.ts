import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, ParseIntPipe } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('assignments')
  async create(@Body() dto: CreateAssignmentDto) {
    const assignment = await this.assignmentService.create(dto);
    // Return patientId and medicationId as top-level properties
    return {
      id: assignment.id,
      patientId: assignment.patient.id,
      medicationId: assignment.medication.id,
      startDate: assignment.startDate,
      days: assignment.days,
    };
  }

  @Get('assignments')
  async findAll() {
    return this.assignmentService.findAll();
  }

  @Get('assignments/remaining-days')
  async getAllRemainingDays() {
    return this.assignmentService.getRemainingDaysForAllAssignments();
  }

  @Get('assignments/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.findOne(id);
  }

  @Patch('assignments/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentService.update(id, dto);
  }

  @Delete('assignments/:id')
  @HttpCode(200)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.assignmentService.remove(id);
    return { message: 'Assignment deleted' };
  }

  // Patient-specific endpoints
  @Get('patients/:patientId/assignments')
  async findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.assignmentService.findByPatient(patientId);
  }

  @Get('patients/:patientId/assignments/remaining-days')
  async getRemainingDays(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.assignmentService.getRemainingDaysForPatientAssignments(patientId);
  }
} 