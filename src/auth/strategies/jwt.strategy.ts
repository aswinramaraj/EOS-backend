import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

<<<<<<< HEAD
// passport-jwt is a CJS package — load safely in ESM context
const _require = createRequire(import.meta.url);
const { Strategy, ExtractJwt } = _require(
  'passport-jwt',
) as typeof import('passport-jwt');

=======
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION',
    });
  }

  /**
   * Called after the JWT signature is verified.
   * The returned value is attached to request.user.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
