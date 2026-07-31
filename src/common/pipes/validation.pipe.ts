import { ValidationPipe, BadRequestException } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';

/**
 * Recursively collects constraint messages from a class-validator error
 * tree. Needed because @ValidateNested (e.g. UpdateProfileDto.addresses)
 * produces a top-level error with an empty `constraints` and the actual
 * failures nested under `children` — reading only the top level silently
 * dropped every nested-array validation message (confirmed live: a failing
 * `addresses[].address_line` check returned `"message": []`, a 400 with no
 * indication of what was wrong).
 */
function collectConstraints(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children?.length) {
      messages.push(...collectConstraints(error.children));
    }
  }
  return messages;
}

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
    const messages = collectConstraints(errors);

    return new BadRequestException({
      message: messages.length === 1 ? messages[0] : messages,
      errorCode: 'VALIDATION_ERROR',
    });
  },
});
