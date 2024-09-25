import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
