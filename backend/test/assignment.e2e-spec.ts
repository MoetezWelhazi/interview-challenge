import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Assignment API (e2e)', () => {
  let app: INestApplication;
  let patientId: number;
  let medicationId: number;
  let assignmentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Create a patient
    const patientRes = await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Patient A', dateOfBirth: '1980-01-01' });
    patientId = patientRes.body.id;

    // Create a medication
    const medRes = await request(app.getHttpServer())
      .post('/medications')
      .send({ name: 'Med A', dosage: '10mg', frequency: 'Once daily' });
    medicationId = medRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should assign a medication to a patient', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        patientId,
        medicationId,
        startDate: '2024-01-01',
        days: 10,
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.patientId).toBe(patientId);
    expect(res.body.medicationId).toBe(medicationId);
    expect(res.body.startDate).toBe('2024-01-01');
    expect(res.body.days).toBe(10);
    assignmentId = res.body.id;
  });

  it('should not assign with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({ patientId })
      .expect(400);
  });

  it('should not assign with invalid dates', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({ patientId, medicationId, startDate: 'not-a-date', days: 5 })
      .expect(400);
  });

  it('should list assignments for a patient', async () => {
    const res = await request(app.getHttpServer())
      .get(`/patients/${patientId}/assignments`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id === assignmentId)).toBe(true);
  });

  it('should get remaining days for assignments', async () => {
    const res = await request(app.getHttpServer())
      .get(`/patients/${patientId}/assignments/remaining-days`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const assignment = res.body.find((a: any) => a.id === assignmentId);
    expect(assignment).toHaveProperty('remainingDays');
    expect(typeof assignment.remainingDays).toBe('number');
  });

  it('should update an assignment', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/assignments/${assignmentId}`)
      .send({ days: 20 })
      .expect(200);
    expect(res.body.days).toBe(20);
  });

  it('should delete an assignment', async () => {
    await request(app.getHttpServer())
      .delete(`/assignments/${assignmentId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/assignments/${assignmentId}`)
      .expect(404);
  });
}); 