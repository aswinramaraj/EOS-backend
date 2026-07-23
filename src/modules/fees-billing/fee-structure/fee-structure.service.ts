import { Injectable } from '@nestjs/common';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';

@Injectable()
export class FeeStructureService {
  create(createFeeStructureDto: CreateFeeStructureDto) {
    return 'This action adds a new feeStructure';
  }

  findAll() {
    return `This action returns all feeStructure`;
  }

  findOne(id: number) {
    return `This action returns a #${id} feeStructure`;
  }

  update(id: number, updateFeeStructureDto: UpdateFeeStructureDto) {
    return `This action updates a #${id} feeStructure`;
  }

  remove(id: number) {
    return `This action removes a #${id} feeStructure`;
  }
}
