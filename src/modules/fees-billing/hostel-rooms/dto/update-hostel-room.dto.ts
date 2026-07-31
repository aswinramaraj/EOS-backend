import { PartialType } from '@nestjs/mapped-types';
import { CreateHostelRoomDto } from './create-hostel-room.dto';

export class UpdateHostelRoomDto extends PartialType(CreateHostelRoomDto) {}
