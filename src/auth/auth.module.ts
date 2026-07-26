import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  /**
   * Export guards so any module can use @UseGuards(JwtAuthGuard, RolesGuard)
   * without importing AuthModule individually (they're exported globally via AppModule).
   */
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
