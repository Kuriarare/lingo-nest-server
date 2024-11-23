import { Injectable, NotFoundException } from '@nestjs/common';
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

  async modifySchedule(body: any): Promise<boolean> {
    const { eventId, start, end, newEvent } = body;
    const schedule = await this.repository.findOne({ where: { id: eventId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    schedule.startTime = new Date(start);
    schedule.endTime = new Date(end);
    schedule.initialDateTime = new Date(newEvent);

    await this.repository.save(schedule);
    return true;
  }
}
