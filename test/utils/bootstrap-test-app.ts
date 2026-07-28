import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { globalValidationPipe } from '../../src/common/pipes/validation.pipe';

/**
 * Mirrors the production bootstrap in src/main.ts (prefix, pipes, filters,
 * interceptors) so e2e requests behave the same way they would in a real
 * deployment. main.ts itself is never invoked in tests (it also starts an
 * HTTP listener), so this stays in sync manually — update both if one changes.
 */
export async function bootstrapTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  await app.init();

  return app;
}
