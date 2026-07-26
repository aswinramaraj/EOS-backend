import { ValidationPipe, BadRequestException } from '@nestjs/common';

/**
 * Global validation pipe instance — applied in main.ts via app.useGlobalPipes().
 *
 * Behaviour:
 *  - whitelist:            strips unknown properties from DTOs
 *  - forbidNonWhitelisted: throws 400 if unknown properties are sent
 *  - transform:            auto-converts plain objects to DTO class instances
 *  - exceptionFactory:     adds errorCode: 'VALIDATION_ERROR' to every 400 response
 */
export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: false,
  },
  exceptionFactory: (errors) => {
    // Flatten class-validator errors into a simple string array
    const messages = errors.flatMap((e) =>
      e.constraints ? Object.values(e.constraints) : [],
    );

    return new BadRequestException({
      message:   messages.length === 1 ? messages[0] : messages,
      errorCode: 'VALIDATION_ERROR',
    });
  },
});
