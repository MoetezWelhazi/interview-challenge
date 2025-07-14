import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Medication API (e2e)', () => {
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

  let createdMedicationId: number;

  it('should create a medication', async () => {
    const res = await request(app.getHttpServer())
      .post('/medications')
      .send({ name: 'Aspirin', dosage: '100mg', frequency: 'Once daily' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Aspirin');
    expect(res.body.dosage).toBe('100mg');
    expect(res.body.frequency).toBe('Once daily');
    createdMedicationId = res.body.id;
  });

  it('should not create a medication with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/medications')
      .send({ name: 'Ibuprofen' })
      .expect(400);
  });

  it('should list medications', async () => {
    const res = await request(app.getHttpServer())
      .get('/medications')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((m: any) => m.id === createdMedicationId)).toBe(true);
  });

  it('should get a single medication', async () => {
    const res = await request(app.getHttpServer())
      .get(`/medications/${createdMedicationId}`)
      .expect(200);
    expect(res.body.id).toBe(createdMedicationId);
    expect(res.body.name).toBe('Aspirin');
  });

  it('should update a medication', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/medications/${createdMedicationId}`)
      .send({ name: 'Aspirin Updated' })
      .expect(200);
    expect(res.body.name).toBe('Aspirin Updated');
  });

  it('should delete a medication', async () => {
    await request(app.getHttpServer())
      .delete(`/medications/${createdMedicationId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/medications/${createdMedicationId}`)
      .expect(404);
  });
}); 