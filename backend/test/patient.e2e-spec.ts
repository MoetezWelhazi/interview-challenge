import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Patient API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdPatientId: number;

  it('should create a patient', async () => {
    const res = await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'John Doe', dateOfBirth: '1990-01-01' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('John Doe');
    expect(res.body.dateOfBirth).toBe('1990-01-01');
    createdPatientId = res.body.id;
  });

  it('should not create a patient with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: '' })
      .expect(400);
  });

  it('should not create a patient with invalid date', async () => {
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Jane', dateOfBirth: 'not-a-date' })
      .expect(400);
  });

  it('should not create a patient with empty name', async () => {
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: '', dateOfBirth: '1990-01-01' })
      .expect(400);
  });

  it('should not create a patient with whitespace-only name', async () => {
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: '   ', dateOfBirth: '1990-01-01' })
      .expect(400);
  });

  it('should not create a patient with future date of birth', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10);
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Future Person', dateOfBirth: futureDate })
      .expect(400);
  });

  it('should not allow duplicate patient names on create', async () => {
    // Create a patient
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Unique Patient', dateOfBirth: '1985-01-01' })
      .expect(201);
    // Try to create another with the same name
    await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Unique Patient', dateOfBirth: '1990-01-01' })
      .expect(400);
  });

  it('should not allow duplicate patient names on update', async () => {
    // Create two patients
    const res1 = await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Patient One', dateOfBirth: '1980-01-01' });
    const res2 = await request(app.getHttpServer())
      .post('/patients')
      .send({ name: 'Patient Two', dateOfBirth: '1981-01-01' });
    // Try to update the second to have the same name as the first
    await request(app.getHttpServer())
      .patch(`/patients/${res2.body.id}`)
      .send({ name: 'Patient One' })
      .expect(400);
  });

  it('should list patients', async () => {
    const res = await request(app.getHttpServer())
      .get('/patients')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === createdPatientId)).toBe(true);
  });

  it('should get a single patient', async () => {
    const res = await request(app.getHttpServer())
      .get(`/patients/${createdPatientId}`)
      .expect(200);
    expect(res.body.id).toBe(createdPatientId);
    expect(res.body.name).toBe('John Doe');
  });

  it('should update a patient', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/patients/${createdPatientId}`)
      .send({ name: 'John Updated' })
      .expect(200);
    expect(res.body.name).toBe('John Updated');
  });

  it('should delete a patient', async () => {
    await request(app.getHttpServer())
      .delete(`/patients/${createdPatientId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/patients/${createdPatientId}`)
      .expect(404);
  });
}); 