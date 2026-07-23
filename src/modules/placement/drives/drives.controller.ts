import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DrivesService } from './drives.service';
import { CreateDriveDto } from './dto/create-drive.dto';
import { UpdateDriveDto } from './dto/update-drive.dto';

@Controller('drives')
export class DrivesController {
  constructor(private readonly drivesService: DrivesService) {}

  @Post()
  create(@Body() createDriveDto: CreateDriveDto) {
    return this.drivesService.create(createDriveDto);
  }

  @Get()
  findAll() {
    return this.drivesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drivesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriveDto: UpdateDriveDto) {
    return this.drivesService.update(+id, updateDriveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drivesService.remove(+id);
  }
}
