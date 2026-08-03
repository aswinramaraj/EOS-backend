import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LibrarySettingsController } from './settings.controller';
import { LibrarySettingsService } from './settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [LibrarySettingsController],
  providers: [LibrarySettingsService],
  exports: [LibrarySettingsService],
})
export class LibrarySettingsModule {}
