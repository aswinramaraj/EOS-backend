import { Injectable } from '@nestjs/common';
import { CreateRevaluationDto } from './dto/create-revaluation.dto';
import { UpdateRevaluationDto } from './dto/update-revaluation.dto';

@Injectable()
export class RevaluationService {
  create(createRevaluationDto: CreateRevaluationDto) {
    return 'This action adds a new revaluation';
  }

  findAll() {
    return `This action returns all revaluation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} revaluation`;
  }

  update(id: number, updateRevaluationDto: UpdateRevaluationDto) {
    return `This action updates a #${id} revaluation`;
  }

  remove(id: number) {
    return `This action removes a #${id} revaluation`;
  }
}
