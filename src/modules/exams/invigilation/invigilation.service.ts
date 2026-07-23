import { Injectable } from '@nestjs/common';
import { CreateInvigilationDto } from './dto/create-invigilation.dto';
import { UpdateInvigilationDto } from './dto/update-invigilation.dto';

@Injectable()
export class InvigilationService {
  create(createInvigilationDto: CreateInvigilationDto) {
    return 'This action adds a new invigilation';
  }

  findAll() {
    return `This action returns all invigilation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invigilation`;
  }

  update(id: number, updateInvigilationDto: UpdateInvigilationDto) {
    return `This action updates a #${id} invigilation`;
  }

  remove(id: number) {
    return `This action removes a #${id} invigilation`;
  }
}
