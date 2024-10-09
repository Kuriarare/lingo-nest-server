import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/user.entity';

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectRepository(Schedule)
    private readonly repository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.repository.find();
  }

  async save(schedule: Schedule): Promise<Schedule> {
    return this.repository.save(schedule);
  }
}
