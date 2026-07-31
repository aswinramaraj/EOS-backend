import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * @Global() so JwtAuthGuard/RolesGuard (and AuthService) are resolvable via
 * @UseGuards(JwtAuthGuard, RolesGuard) from ANY feature module without that
 * module needing `imports: [AuthModule]` itself — required since every
 * business module will eventually guard its routes this way.
 */
@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
