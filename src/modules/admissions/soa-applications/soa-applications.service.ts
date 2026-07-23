import { Injectable } from '@nestjs/common';
import { CreateSoaApplicationDto } from './dto/create-soa-application.dto';
import { UpdateSoaApplicationDto } from './dto/update-soa-application.dto';

@Injectable()
export class SoaApplicationsService {
  create(createSoaApplicationDto: CreateSoaApplicationDto) {
    return 'This action adds a new soaApplication';
  }

  findAll() {
    return `This action returns all soaApplications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} soaApplication`;
  }

  update(id: number, updateSoaApplicationDto: UpdateSoaApplicationDto) {
    return `This action updates a #${id} soaApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} soaApplication`;
  }
}
