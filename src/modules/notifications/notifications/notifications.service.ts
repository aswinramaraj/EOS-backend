import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Real, Prisma-backed create — this was previously unimplemented Nest CLI
   * scaffolding (`return 'This action adds a new notification'`). Only
   * `create()` is implemented for real; `findAll`/`findOne`/`update`/`remove`
   * below are left as the original stubs since nothing calls them yet and
   * building out a full notifications inbox is a separate piece of work.
   * This does not push over the websocket gateway (no real-time delivery
   * yet) — it persists a row a client can poll for via a future
   * `GET /notifications` endpoint.
   */
  create(dto: CreateNotificationDto) {
    return this.prisma.notifications.create({ data: dto });
  }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
