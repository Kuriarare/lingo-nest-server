import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ScheduleRepository } from './schedule.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly scheduleRepository: ScheduleRepository,
    
  ) {}

  async findAll() {
    const users = await this.usersRepository.findAll();
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }
    return users;
  }

  async assignStudent(body: any) {
    const assignedUser = await this.usersRepository.assignStudent(body);
    if (!assignedUser) {
      throw new NotFoundException('User not found');
    }
    return assignedUser;
  }

  async remove(email: string) {
    const removedUser = await this.usersRepository.remove(email);
    if (!removedUser.affected) {
      throw new NotFoundException('User not found');
    }
    return removedUser;
  }

  async update(updateUser: any) {
    const updatedUser = await this.usersRepository.update(updateUser);
    if (!updatedUser.affected) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async removeStudentsFromTeacher(body: any) {
    const success = await this.usersRepository.removeStudentsFromTeacher(body);
    if (!success) {
      throw new NotFoundException('Schedule not found');
    }
    return success;
  }

  async modifySchedule(body: any) {
    const success = await this.scheduleRepository.modifySchedule(body);
    if (!success) {
      throw new NotFoundException('Schedule not found');
    }
    return 'success';
  }
  async removeEvents(body: {
    eventIds: string[];
    teacherId: string;
    studentId: string;
  }) {
    const success = await this.scheduleRepository.removeEvents(body);
    if (!success) {
      throw new NotFoundException('Events not found');
    }
    return 'success';
  }
  async addEvent(event: any) {
    const newEvent = {
      ...event,
      initialDateTime: new Date(event.initialDateTime),
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    };
    const success = await this.scheduleRepository.save(newEvent);
    if (!success) {
      throw new NotFoundException('Failed to create event');
    }
    return 'success';
  }
}
