import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { TransportService } from './transport.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';

@WebSocketGateway()
export class TransportGateway {
  constructor(private readonly transportService: TransportService) {}

  @SubscribeMessage('createTransport')
  create(@MessageBody() createTransportDto: CreateTransportDto) {
    return this.transportService.create(createTransportDto);
  }

  @SubscribeMessage('findAllTransport')
  findAll() {
    return this.transportService.findAll();
  }

  @SubscribeMessage('findOneTransport')
  findOne(@MessageBody() id: number) {
    return this.transportService.findOne(id);
  }

  @SubscribeMessage('updateTransport')
  update(@MessageBody() updateTransportDto: UpdateTransportDto) {
    return this.transportService.update(updateTransportDto.id, updateTransportDto);
  }

  @SubscribeMessage('removeTransport')
  remove(@MessageBody() id: number) {
    return this.transportService.remove(id);
  }
}
