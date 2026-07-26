import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated user (from the JWT payload) into a controller parameter.
 *
 * The JWT strategy attaches the full user object (id, email, role) to request.user.
 *
 * Usage:
 *   findMe(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
