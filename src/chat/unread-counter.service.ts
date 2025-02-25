import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UnreadGlobalMessage } from './entities/unread-global-messages.entity';
import { CounterField } from './types';

@Injectable()
export class UnreadCounterService {
  constructor(
    @InjectRepository(UnreadGlobalMessage)
    private readonly unreadRepo: Repository<UnreadGlobalMessage>,
  ) {}

  async bulkIncrementCounter(
    counterField: CounterField,
    buildConditions: (qb: SelectQueryBuilder<UnreadGlobalMessage>) => void,
    excludedEmail: string,
  ): Promise<number> {
    const subQuery = this.unreadRepo
      .createQueryBuilder('unread')
      .innerJoin('unread.user', 'user')
      .select('unread.id')
      .where('user.email != :excludedEmail', { excludedEmail });

    buildConditions(subQuery);

    const result = await this.unreadRepo
      .createQueryBuilder()
      .update(UnreadGlobalMessage)
      .set({ [counterField]: () => `${counterField} + 1` })
      .where(`id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .execute();

    return result.affected || 0;
  }
}
