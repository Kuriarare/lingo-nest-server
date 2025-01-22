import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  // OneToMany,
} from 'typeorm';
// import { UnreadGlobalMessage } from './unread-global-messages.entity';

@Entity('global-chats')
export class GlobalChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 100 })
  room: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userUrl?: string;

  @Column({ default: 0 })
  unreadCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  // @OneToMany(
  //   () => UnreadGlobalMessage,
  //   (unreadMessage) => unreadMessage.message,
  // )
  // unreadMessages: UnreadGlobalMessage[];
}
