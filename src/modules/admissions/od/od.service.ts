import { Injectable } from '@nestjs/common';
import { CreateOdDto } from './dto/create-od.dto';
import { UpdateOdDto } from './dto/update-od.dto';

@Injectable()
export class OdService {
  create(createOdDto: CreateOdDto) {
    return 'This action adds a new od';
  }

  findAll() {
    return `This action returns all od`;
  }

  findOne(id: number) {
    return `This action returns a #${id} od`;
  }

  update(id: number, updateOdDto: UpdateOdDto) {
    return `This action updates a #${id} od`;
  }

  remove(id: number) {
    return `This action removes a #${id} od`;
  }
}
