import { Injectable } from '@nestjs/common';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';

@Injectable()
export class ExamTypesService {
  create(createExamTypeDto: CreateExamTypeDto) {
    return 'This action adds a new examType';
  }

  findAll() {
    return `This action returns all examTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examType`;
  }

  update(id: number, updateExamTypeDto: UpdateExamTypeDto) {
    return `This action updates a #${id} examType`;
  }

  remove(id: number) {
    return `This action removes a #${id} examType`;
  }
}
