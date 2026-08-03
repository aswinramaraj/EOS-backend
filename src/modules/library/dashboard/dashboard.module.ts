import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LibraryDashboardController } from './dashboard.controller';
import { LibraryDashboardService } from './dashboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [LibraryDashboardController],
  providers: [LibraryDashboardService],
})
export class LibraryDashboardModule {}
