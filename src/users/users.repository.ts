import { Injectable } from '@nestjs/common';
import { Schedule, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { EntityManager } from 'typeorm';
import { In } from 'typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnreadGlobalMessage } from 'src/chat/entities/unread-global-messages.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @InjectRepository(UnreadGlobalMessage)
    private readonly unReadGlobalMessageRepo: Repository<UnreadGlobalMessage>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ],
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
      ],
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

    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
      relations: ['students', 'teacherSchedules'],
    });

    const student = await this.usersRepository.findOne({
      where: { id: studentId },
      relations: ['teacher', 'studentSchedules'],
    });

    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Teacher not found.');
    }
    if (!student || student.role !== 'user') {
      throw new Error('Student not found.');
    }

    teacher.students.push(student);
    student.teacher = teacher;

    // Ensure the `initialDateTime` field is populated
    const updatedEvents = events.map((event) => ({
      ...event,
      student,
      teacher,
      studentId,
      teacherId,
      startTime: new Date(event.start), // Save UTC start time
      endTime: new Date(event.end), // Save UTC end time
      initialDateTime: new Date(event.start), // Ensure this is populated as well
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
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return 'no user found';
    }
    await this.unReadGlobalMessageRepo.delete({
      user: { id: user.id },
    });
    const deletedUser = await this.usersRepository.delete({ email });
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

  async updateUserProfileImage(
    userId: string,
    imageUrl: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'students',
        'teacher',
        'studentSchedules',
        'teacherSchedules',
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.avatarUrl = imageUrl;

    const updatedUser = await this.usersRepository.save(user);
    return updatedUser;
  }

  async removeStudentsFromTeacher(body: any): Promise<any> {
    const { teacherId, studentIds } = body;

    // Fetch the teacher with necessary relations
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
      relations: ['students', 'teacherSchedules'],
    });

    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Teacher not found.');
    }

    // Fetch all the students to be removed
    const students = await this.usersRepository.find({
      where: { id: In(studentIds) },
      relations: ['studentSchedules'],
    });

    if (!students || students.length === 0) {
      throw new Error('No students found.');
    }

    // Try to remove schedules related to the teacher and the students
    const deleteResult = await this.scheduleRepository.find({
      where: {
        teacherId: teacher.id,
        studentId: In(studentIds), // Ensure both teacherId and studentId are in the same schedule
      },
    });
    const idsToDelete = deleteResult.map((schedule) => schedule.id); // Get all the IDs to delete
    if (idsToDelete.length > 0) {
      console.log('This is the Schedule id', idsToDelete);
      await this.scheduleRepository.delete(idsToDelete); // Directly delete by IDs
      console.log('Schedules deleted');
    }
    // else {
    //   throw new Error('No schedules found to delete.');
    // }
    // If no schedules were deleted, throw an error and stop further execution
    // if (deleteResult.affected === 0) {
    //   throw new Error('No schedules were deleted. Rolling back.');
    // }
    // console.log(deleteResult);

    // Remove each student from the teacher's students array
    teacher.students = teacher.students.filter(
      (student) => !studentIds.includes(student.id),
    );

    // Remove the teacher reference from each student's teacher field
    students.forEach((student) => {
      student.teacher = null;
    });

    // Save updated teacher and students
    await this.usersRepository.save(teacher);
    await this.usersRepository.save(students);

    return {
      message:
        'Students removed from teacher successfully, and schedules deleted.',
    };
  }

  async find() {
    return await this.usersRepository.find();
  }

  // async saveInUnreadMessagesEnt() {
  //   return await this.usersRepository.save();
  // }
}
