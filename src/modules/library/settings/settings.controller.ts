import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { LibrarySettingsService } from './settings.service';
import { UpdateLibrarySettingsDto } from './dto/update-library-settings.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('library/settings')
export class LibrarySettingsController {
  constructor(private readonly settingsService: LibrarySettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  update(@Body() dto: UpdateLibrarySettingsDto) {
    return this.settingsService.update(dto);
  }
}
