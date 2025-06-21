import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  const VALID_API_KEY =
    '1e6e316e4f04f4b546dc10ebb7bc3014e11083c0cc250588ff5805ddb1f75b06';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should accept a valid event and return success', async () => {
    const response = await request(app.getHttpServer())
      .post('/analytics/collect')
      .set('x-api-key', VALID_API_KEY)
      .send({
        event: 'test_event',
        timestamp: new Date().toISOString(),
        device: 'mobile',
        metadata: { userId: 'testuser123' },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Event received');
    expect(response.body).toHaveProperty('appId');
  });
});
