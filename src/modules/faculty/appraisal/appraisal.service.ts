import { Injectable } from '@nestjs/common';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';
import { UpdateAppraisalDto } from './dto/update-appraisal.dto';

@Injectable()
export class AppraisalService {
  create(createAppraisalDto: CreateAppraisalDto) {
    return 'This action adds a new appraisal';
  }

  findAll() {
    return `This action returns all appraisal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appraisal`;
  }

  update(id: number, updateAppraisalDto: UpdateAppraisalDto) {
    return `This action updates a #${id} appraisal`;
  }

  remove(id: number) {
    return `This action removes a #${id} appraisal`;
  }
}
