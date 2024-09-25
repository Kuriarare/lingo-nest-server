import { Injectable } from '@nestjs/common';
import { Schedule, User } from './entities/user.entity'; // Ensure this imports Schedule correctly
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>, // Add this line
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ], // Adjust as needed
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: { id },
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ], // Adjust as needed
    });
  }

  async register(newUser: User): Promise<User> {
    return this.usersRepository.save(newUser);
  }

  async login(email: string, password: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ],
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return undefined;
  }
  async save(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ],
    });

    return users;
  }

  async assignStudent(body: any): Promise<any> {
    const { teacherId, studentId, events } = body;

    // Fetch teacher and student with necessary relations
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
      relations: ['students', 'teacherSchedules'],
    });

    const student = await this.usersRepository.findOne({
      where: { id: studentId },
      relations: ['teacher', 'studentSchedules'],
    });

    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Teacher not found or not a teacher.');
    }
    if (!student || student.role !== 'user') {
      throw new Error('Student not found or not a student.');
    }

    teacher.students.push(student);

    student.teacher = teacher;

    const updatedEvents = events.map((event) => ({
      ...event,
      student: student,
      teacher: teacher,
      studentId: studentId,
    }));

    const savedSchedules = await this.scheduleRepository.save(updatedEvents);

    teacher.teacherSchedules = [...teacher.teacherSchedules, ...savedSchedules];
    student.studentSchedules = [...student.studentSchedules, ...savedSchedules];

    await this.usersRepository.save(teacher);
    await this.usersRepository.save(student);

    return {
      message: 'Teacher and student updated successfully with schedules',
    };
  }

  async remove(email: string): Promise<any> {
    const deletedUser = await this.usersRepository.delete({ email });

    if (!deletedUser.affected) {
      return 'no user found';
    }
    return deletedUser;
  }

  async update(updateUser: any): Promise<any> {
    const { email, ...rest } = updateUser;

    const updatedUser = await this.usersRepository.update({ email }, rest);

    if (!updatedUser.affected) {
      return 'no user found';
    }
    return updatedUser;
  }
}
