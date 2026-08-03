import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LibraryReportsController } from './reports.controller';
import { LibraryReportsService } from './reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [LibraryReportsController],
  providers: [LibraryReportsService],
})
export class LibraryReportsModule {}
