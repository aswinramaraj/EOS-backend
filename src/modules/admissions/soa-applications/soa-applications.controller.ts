import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SoaApplicationsService } from './soa-applications.service';
import { CreateSoaApplicationDto } from './dto/create-soa-application.dto';
import { UpdateSoaApplicationDto } from './dto/update-soa-application.dto';

@Controller('soa-applications')
export class SoaApplicationsController {
  constructor(private readonly soaApplicationsService: SoaApplicationsService) {}

  @Post()
  create(@Body() createSoaApplicationDto: CreateSoaApplicationDto) {
    return this.soaApplicationsService.create(createSoaApplicationDto);
  }

  @Get()
  findAll() {
    return this.soaApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soaApplicationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoaApplicationDto: UpdateSoaApplicationDto) {
    return this.soaApplicationsService.update(+id, updateSoaApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soaApplicationsService.remove(+id);
  }
}
