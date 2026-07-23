import { Injectable } from '@nestjs/common';
import { CreateBonafideDto } from './dto/create-bonafide.dto';
import { UpdateBonafideDto } from './dto/update-bonafide.dto';

@Injectable()
export class BonafideService {
  create(createBonafideDto: CreateBonafideDto) {
    return 'This action adds a new bonafide';
  }

  findAll() {
    return `This action returns all bonafide`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bonafide`;
  }

  update(id: number, updateBonafideDto: UpdateBonafideDto) {
    return `This action updates a #${id} bonafide`;
  }

  remove(id: number) {
    return `This action removes a #${id} bonafide`;
  }
}
