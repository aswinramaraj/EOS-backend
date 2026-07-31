import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuotaService } from './quota.service';
import { QuotaController } from './quota.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuotaController],
  providers: [QuotaService],
})
export class QuotaModule {}
