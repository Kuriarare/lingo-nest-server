import { UnreadGlobalMessage } from 'src/chat/entities/unread-global-messages.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  language: string;

  @Column({ type: 'enum', enum: ['online', 'offline'], default: 'offline' })
  online: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  postal: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['user', 'teacher', 'admin'], default: 'user' })
  role: string;

  @Column({ type: 'uuid', default: '123e4567-e89b-12d3-a456-426614174000' })
  teachersRoom: string;

  @Column({ type: 'uuid', default: '123e4567-e89b-12d3-a456-426614174001' })
  generalChat: string;

  @OneToMany(() => Schedule, (schedule) => schedule.student, { nullable: true })
  studentSchedules: Schedule[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher, {
    nullable: true,
  })
  teacherSchedules: Schedule[];

  @OneToMany(() => User, (student) => student.teacher)
  students: User[];

  @ManyToOne(() => User, (teacher) => teacher.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @OneToMany(() => UnreadGlobalMessage, (unreadMessage) => unreadMessage.user)
  unreadMessages: UnreadGlobalMessage[];
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Store the initial date and time of the event in UTC
  @Column({
    type: 'timestamp',
    transformer: {
      from: (value) => (value ? new Date(value) : null), // Ensure valid date
      to: (value) => (value instanceof Date ? value.toISOString() : null), // Handle valid Date
    },
  })
  initialDateTime: Date;

  // Store the start and end times of each occurrence in UTC
  @Column({
    type: 'timestamp',
    transformer: {
      from: (value) => (value ? new Date(value) : null), // Ensure valid date
      to: (value) => (value instanceof Date ? value.toISOString() : null), // Handle valid Date
    },
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
    transformer: {
      from: (value) => (value ? new Date(value) : null), // Ensure valid date
      to: (value) => (value instanceof Date ? value.toISOString() : null), // Handle valid Date
    },
  })
  endTime: Date;

  @Column({ type: 'varchar' })
  dayOfWeek: string;

  @Column({ type: 'varchar' })
  teacherName: string;

  @Column({ type: 'varchar' })
  studentName: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User, (student) => student.studentSchedules, {
    nullable: false,
  })
  @ManyToOne(() => User, (student) => student.studentSchedules, {
    nullable: true,
    onDelete: 'CASCADE', // Deletes schedules when the user is deleted
  })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  teacherId: string;

  @ManyToOne(() => User, (teacher) => teacher.teacherSchedules, {
    nullable: true,
    onDelete: 'CASCADE', // Deletes schedules when the teacher is deleted
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;
}
