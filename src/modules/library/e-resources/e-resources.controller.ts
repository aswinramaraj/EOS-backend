import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EResourcesService } from './e-resources.service';
import { CreateEResourceDto } from './dto/create-e-resource.dto';
import { UpdateEResourceDto } from './dto/update-e-resource.dto';

@Controller('e-resources')
export class EResourcesController {
  constructor(private readonly eResourcesService: EResourcesService) {}

  @Post()
  create(@Body() createEResourceDto: CreateEResourceDto) {
    return this.eResourcesService.create(createEResourceDto);
  }

  @Get()
  findAll() {
    return this.eResourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eResourcesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEResourceDto: UpdateEResourceDto) {
    return this.eResourcesService.update(+id, updateEResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eResourcesService.remove(+id);
  }
}
