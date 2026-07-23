import { Injectable } from '@nestjs/common';
import { CreateGateLedgerDto } from './dto/create-gate-ledger.dto';
import { UpdateGateLedgerDto } from './dto/update-gate-ledger.dto';

@Injectable()
export class GateLedgerService {
  create(createGateLedgerDto: CreateGateLedgerDto) {
    return 'This action adds a new gateLedger';
  }

  findAll() {
    return `This action returns all gateLedger`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gateLedger`;
  }

  update(id: number, updateGateLedgerDto: UpdateGateLedgerDto) {
    return `This action updates a #${id} gateLedger`;
  }

  remove(id: number) {
    return `This action removes a #${id} gateLedger`;
  }
}
