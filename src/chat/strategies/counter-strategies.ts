import { SelectQueryBuilder, Brackets } from 'typeorm';
import { UnreadGlobalMessage } from '../entities/unread-global-messages.entity';

export type CounterStrategy = {
  roomPattern: RegExp;
  applyConditions: (
    qb: SelectQueryBuilder<UnreadGlobalMessage>,
    room: string,
  ) => void;
};

export const generalLanguageStrategy: CounterStrategy = {
  roomPattern: /^uuid-(english|spanish|polish)$/,
  applyConditions: (qb, room) => {
    const language = room.split('-')[1];
    qb.andWhere(
      new Brackets((subQb) => {
        subQb
          .where('user.language = :language', { language })
          .orWhere('user.role = :role', { role: 'admin' });
      }),
    );
  },
};

export const teacherLanguageStrategy: CounterStrategy = {
  roomPattern: /^uuid-teacher-(english|spanish|polish)$/,
  applyConditions: (qb, room) => {
    const language = room.split('-')[2];
    qb.andWhere(
      new Brackets((subQb) => {
        subQb
          .where('user.language = :language', { language })
          .andWhere('user.role = :teacherRole', { teacherRole: 'teacher' })
          .orWhere('user.role = :adminRole', { adminRole: 'admin' });
      }),
    );
  },
};

export const randomRoomStrategy: CounterStrategy = {
  roomPattern: /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
  applyConditions: (qb, room) => {
    qb.andWhere(
      new Brackets((subQb) => {
        subQb
          .where('user.teacherId = :roomId', { roomId: room })
          .orWhere('user.id = :roomId', { roomId: room });
      }),
    );
  },
};
