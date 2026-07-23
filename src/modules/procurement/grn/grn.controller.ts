import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GrnService } from './grn.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';

@Controller('grn')
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  @Post()
  create(@Body() createGrnDto: CreateGrnDto) {
    return this.grnService.create(createGrnDto);
  }

  @Get()
  findAll() {
    return this.grnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrnDto: UpdateGrnDto) {
    return this.grnService.update(+id, updateGrnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grnService.remove(+id);
  }
}
