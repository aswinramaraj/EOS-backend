import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { bootstrapTestApp } from './utils/bootstrap-test-app';

interface ApiEnvelope<T> {
  data: T;
}

/**
 * Requires a running, seeded Postgres database (DATABASE_URL) — run
 * `npm run seed` first. Every seeded user shares the password `EOS@test123`
 * (see prisma/seed.ts). Skipped automatically by `npm test` (only matched by
 * `npm run test:e2e`, see test/jest-e2e.json).
 */
describe('Book Categories API (e2e)', () => {
  let app: INestApplication<App>;

  let adminToken: string;
  let libraryToken: string;
  let studentToken: string;
  let createdCategoryId: number;

  const uniqueName = `E2E Category ${Date.now()}`;

  const login = async (email: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });
    return (res.body as ApiEnvelope<{ accessToken: string }>).data.accessToken;
  };

  beforeAll(async () => {
    app = await bootstrapTestApp();

    adminToken = await login('admin@eos.test', 'EOS@test123');
    libraryToken = await login('library@eos.test', 'EOS@test123');
    studentToken = await login('student@eos.test', 'EOS@test123');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    it('rejects requests with no token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories')
        .expect(401);
    });

    it('rejects requests with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  describe('authorization', () => {
    it('allows a student to read categories (read is open to any authenticated role)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('prevents a student from creating a category', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: `${uniqueName}-student-attempt` })
        .expect(403);
    });

    it('allows a library user to create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({ name: uniqueName })
        .expect(201);

      createdCategoryId = (res.body as ApiEnvelope<{ id: number }>).data.id;
      expect(createdCategoryId).toBeDefined();
    });

    it('allows an admin to create a category', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `${uniqueName}-admin` })
        .expect(201);
    });
  });

  describe('CRUD workflow', () => {
    it('reads the created category by id', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/library/book-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });

    it('lists categories', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });

    it('rejects duplicate category names', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({ name: uniqueName })
        .expect(409);
    });

    it('updates the created category', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/library/book-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({ name: `${uniqueName} (renamed)` })
        .expect(200);
    });

    it('prevents a student from deleting a category', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/library/book-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('deletes the created category', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/library/book-categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });
  });

  describe('fuzzy search', () => {
    const fuzzyName = `Engineering ${Date.now()}`;
    let fuzzyCategoryId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/library/book-categories')
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({ name: fuzzyName })
        .expect(201);

      fuzzyCategoryId = (res.body as ApiEnvelope<{ id: number }>).data.id;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/library/book-categories/${fuzzyCategoryId}`)
        .set('Authorization', `Bearer ${libraryToken}`);
    });

    it('rejects requests with no token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories/search')
        .query({ q: 'engineering' })
        .expect(401);
    });

    it('returns a validation error for an empty query', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories/search')
        .query({ q: '' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(400);
    });

    it('returns a validation error for a query shorter than 2 characters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/library/book-categories/search')
        .query({ q: 'e' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(400);
    });

    it('finds the category despite typos in the query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/library/book-categories/search')
        .query({ q: fuzzyName.replace('Engineering', 'enginering') })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);

      const data = (res.body as ApiEnvelope<Array<{ id: number }>>).data;
      expect(data.some((category) => category.id === fuzzyCategoryId)).toBe(
        true,
      );
    });

    it('returns an empty array for unrelated text', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/library/book-categories/search')
        .query({ q: 'zzzqqqxxxnomatch' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);

      const data = (res.body as ApiEnvelope<unknown[]>).data;
      expect(data).toEqual([]);
    });
  });
});
