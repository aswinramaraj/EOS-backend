import { Injectable } from '@nestjs/common';
import { CreateMediaRequestDto } from './dto/create-media-request.dto';
import { UpdateMediaRequestDto } from './dto/update-media-request.dto';

@Injectable()
export class MediaRequestsService {
  create(createMediaRequestDto: CreateMediaRequestDto) {
    return 'This action adds a new mediaRequest';
  }

  findAll() {
    return `This action returns all mediaRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mediaRequest`;
  }

  update(id: number, updateMediaRequestDto: UpdateMediaRequestDto) {
    return `This action updates a #${id} mediaRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} mediaRequest`;
  }
}
