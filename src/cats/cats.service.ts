import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class CatsService {
  constructor(@InjectRepository(Cat) private readonly catRepository: Repository<Cat>, private eventGateway: EventsGateway) {}

  async create(cat: Cat) {
    this.eventGateway.server.emit('crearGato', 'nuevo gato');
    return await this.catRepository.insert(cat);
  }

  async findAll(): Promise<Cat[]> {
    return await this.catRepository.find();
  }
}