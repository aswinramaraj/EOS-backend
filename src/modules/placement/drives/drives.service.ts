import { Injectable } from '@nestjs/common';
import { CreateDriveDto } from './dto/create-drive.dto';
import { UpdateDriveDto } from './dto/update-drive.dto';

@Injectable()
export class DrivesService {
  create(createDriveDto: CreateDriveDto) {
    return 'This action adds a new drive';
  }

  findAll() {
    return `This action returns all drives`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drive`;
  }

  update(id: number, updateDriveDto: UpdateDriveDto) {
    return `This action updates a #${id} drive`;
  }

  remove(id: number) {
    return `This action removes a #${id} drive`;
  }
}
