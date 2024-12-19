import { Injectable } from '@nestjs/common';
import { CreateMetropoliDto } from './dto/create-metropoli.dto';
import { UpdateMetropoliDto } from './dto/update-metropoli.dto';

@Injectable()
export class MetropolisService {
  create(createMetropoliDto: CreateMetropoliDto) {
    return 'This action adds a new metropoli';
  }

  findAll() {
    return `This action returns all metropolis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} metropoli`;
  }

  update(id: number, updateMetropoliDto: UpdateMetropoliDto) {
    return `This action updates a #${id} metropoli`;
  }

  remove(id: number) {
    return `This action removes a #${id} metropoli`;
  }
}
