import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MediaRequestsService } from './media-requests.service';
import { CreateMediaRequestDto } from './dto/create-media-request.dto';
import { UpdateMediaRequestDto } from './dto/update-media-request.dto';

@Controller('media-requests')
export class MediaRequestsController {
  constructor(private readonly mediaRequestsService: MediaRequestsService) {}

  @Post()
  create(@Body() createMediaRequestDto: CreateMediaRequestDto) {
    return this.mediaRequestsService.create(createMediaRequestDto);
  }

  @Get()
  findAll() {
    return this.mediaRequestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaRequestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaRequestDto: UpdateMediaRequestDto) {
    return this.mediaRequestsService.update(+id, updateMediaRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaRequestsService.remove(+id);
  }
}
