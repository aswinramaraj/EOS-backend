import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { SearchMembersDto } from './dto/search-members.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('library/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  findAll(@Query() query: SearchMembersDto) {
    return this.membersService.findAll(query);
  }
}
