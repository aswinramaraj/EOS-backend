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

describe('Books API (e2e)', () => {
  let app: INestApplication<App>;

  let adminToken: string;
  let libraryToken: string;
  let studentToken: string;
  let categoryId: number;

  const uniqueQr = `QR-E2E-${Date.now()}`;
  let createdBookId: number;

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

    const categoryRes = await request(app.getHttpServer())
      .post('/api/v1/book-categories')
      .set('Authorization', `Bearer ${libraryToken}`)
      .send({ name: `E2E Category ${Date.now()}` });

    categoryId = (categoryRes.body as ApiEnvelope<{ id: number }>).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    it('rejects requests with no token', async () => {
      await request(app.getHttpServer()).get('/api/v1/books').expect(401);
    });

    it('rejects requests with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  describe('authorization', () => {
    it('allows a student to read books (read is open to any authenticated role)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('prevents a student from creating a book', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qr_code: `${uniqueQr}-student-attempt`,
          title: 'Unauthorized Book',
          category_id: categoryId,
          total_copies: 1,
        })
        .expect(403);
    });

    it('allows a library user to create a book', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({
          qr_code: uniqueQr,
          title: 'Computer Networks',
          category_id: categoryId,
          total_copies: 3,
        })
        .expect(201);

      createdBookId = (res.body as ApiEnvelope<{ id: number }>).data.id;
      expect(createdBookId).toBeDefined();
    });

    it('allows an admin to create a book', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          qr_code: `${uniqueQr}-admin`,
          title: 'Operating Systems',
          category_id: categoryId,
          total_copies: 2,
        })
        .expect(201);
    });
  });

  describe('CRUD workflow', () => {
    it('reads the created book by id', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/books/${createdBookId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });

    it('lists books', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books')
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });

    it('updates the created book', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/books/${createdBookId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({ title: 'Computer Networks (2nd Edition)' })
        .expect(200);
    });

    it('prevents a student from updating a book', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/books/${createdBookId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked title' })
        .expect(403);
    });

    it('deletes the created book', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/books/${createdBookId}`)
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);
    });
  });

  describe('fuzzy search', () => {
    const fuzzyQr = `${uniqueQr}-fuzzy`;
    let fuzzyBookId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${libraryToken}`)
        .send({
          qr_code: fuzzyQr,
          title: 'Computer Science Engineering',
          category_id: categoryId,
          total_copies: 1,
        })
        .expect(201);

      fuzzyBookId = (res.body as ApiEnvelope<{ id: number }>).data.id;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/books/${fuzzyBookId}`)
        .set('Authorization', `Bearer ${libraryToken}`);
    });

    it('rejects requests with no token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: 'computer' })
        .expect(401);
    });

    it('returns a validation error for an empty query', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: '' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(400);
    });

    it('returns a validation error for a query shorter than 2 characters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: 'a' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(400);
    });

    it('finds the book with a plain matching query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: 'computer' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);

      const data = (res.body as ApiEnvelope<Array<{ id: number }>>).data;
      expect(data.some((book) => book.id === fuzzyBookId)).toBe(true);
    });

    it('finds the book despite typos in the query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: 'comuter scince' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);

      const data = (
        res.body as ApiEnvelope<Array<{ id: number; similarity: number }>>
      ).data;
      expect(data.some((book) => book.id === fuzzyBookId)).toBe(true);
    });

    it('returns an empty array for unrelated text', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books/search')
        .query({ q: 'zzzqqqxxxnomatch' })
        .set('Authorization', `Bearer ${libraryToken}`)
        .expect(200);

      const data = (res.body as ApiEnvelope<unknown[]>).data;
      expect(data).toEqual([]);
    });
  });
});
