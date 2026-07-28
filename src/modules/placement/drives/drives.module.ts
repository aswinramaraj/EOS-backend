import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CompaniesModule } from '../companies/companies.module';
import { DrivesService } from './drives.service';
import { DrivesController } from './drives.controller';
import { StudentDrivesController } from './student-drives.controller';

@Module({
  imports: [PrismaModule, CompaniesModule],
  controllers: [DrivesController, StudentDrivesController],
  providers: [DrivesService],
})
export class DrivesModule {}
