import { Injectable } from '@nestjs/common';
import { CreateEResourceDto } from './dto/create-e-resource.dto';
import { UpdateEResourceDto } from './dto/update-e-resource.dto';

@Injectable()
export class EResourcesService {
  create(createEResourceDto: CreateEResourceDto) {
    return 'This action adds a new eResource';
  }

  findAll() {
    return `This action returns all eResources`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eResource`;
  }

  update(id: number, updateEResourceDto: UpdateEResourceDto) {
    return `This action updates a #${id} eResource`;
  }

  remove(id: number) {
    return `This action removes a #${id} eResource`;
  }
}
