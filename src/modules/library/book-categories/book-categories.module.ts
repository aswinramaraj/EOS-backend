import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookCategoriesController } from './book-categories.controller';
import { BookCategoriesService } from './book-categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookCategoriesController],
  providers: [BookCategoriesService],
})
export class BookCategoriesModule {}
