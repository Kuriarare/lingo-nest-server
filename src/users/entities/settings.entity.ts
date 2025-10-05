import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  darkMode: boolean;

  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn()
  user: User;
}