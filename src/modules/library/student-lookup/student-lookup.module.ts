import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentLookupController } from './student-lookup.controller';
import { StudentLookupService } from './student-lookup.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentLookupController],
  providers: [StudentLookupService],
})
export class StudentLookupModule {}
