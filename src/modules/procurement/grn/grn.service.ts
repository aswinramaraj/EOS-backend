import { Injectable } from '@nestjs/common';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';

@Injectable()
export class GrnService {
  create(createGrnDto: CreateGrnDto) {
    return 'This action adds a new grn';
  }

  findAll() {
    return `This action returns all grn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} grn`;
  }

  update(id: number, updateGrnDto: UpdateGrnDto) {
    return `This action updates a #${id} grn`;
  }

  remove(id: number) {
    return `This action removes a #${id} grn`;
  }
}
