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

  @OneToMany(() => Schedule, (schedule) => schedule.student)
  studentSchedules: Schedule[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  teacherSchedules: Schedule[];

  @OneToMany(() => User, (student) => student.teacher)
  students: User[];

  @ManyToOne(() => User, (teacher) => teacher.students)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  date: string;

  @Column({ type: 'varchar' })
  startTime: string;

  @Column({ type: 'varchar' })
  endTime: string;

  @Column({ type: 'varchar' })
  dayOfWeek: string;

  @Column({ type: 'varchar' })
  teacherName: string;

  @Column({ type: 'varchar' })
  studentName: string;

  @Column() // Store studentId directly
  studentId: string;

  @ManyToOne(() => User, (student) => student.studentSchedules, {
    nullable: false,
  })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column() // Store teacherId directly
  teacherId: string;

  @ManyToOne(() => User, (teacher) => teacher.teacherSchedules, {
    nullable: false,
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;
}
