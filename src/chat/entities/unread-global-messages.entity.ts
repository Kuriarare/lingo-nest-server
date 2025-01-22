import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
// import { GlobalChat } from './global-chat.entity';

@Entity('unread-global-messages')
export class UnreadGlobalMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => GlobalChat, (globalChat) => globalChat.id, {
  //   nullable: false,
  // })
  // @JoinColumn({ name: 'messageId' })
  // message: GlobalChat;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', default: 0 })
  randomRoom: number;

  @Column({ type: 'int', default: 0 })
  generalEnglishRoom: number;

  @Column({ type: 'int', default: 0 })
  teachersEnglishRoom: number;

  @Column({ type: 'int', default: 0 })
  generalSpanishRoom: number;

  @Column({ type: 'int', default: 0 })
  teachersSpanishRoom: number;

  @Column({ type: 'int', default: 0 })
  generalPolishRoom: number;

  @Column({ type: 'int', default: 0 })
  teachersPolishRoom: number;
}
