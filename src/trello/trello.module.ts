import { Module } from '@nestjs/common';

import { TrelloController } from './trello.controller';
import { TrelloService } from './trello.service';
import { TrelloCallbackController } from './trello.callback.controller';

@Module({
  controllers: [TrelloController, TrelloCallbackController],
  providers: [TrelloService],
  exports: [TrelloService],
})
export class TrelloModule {}
