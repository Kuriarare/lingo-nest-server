import { Module } from '@nestjs/common';
import { S3Service } from './upload-files.service';
import { UploadController } from './upload-files.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [UploadController],
  providers: [S3Service],
})
export class UploadFilesModule {}
