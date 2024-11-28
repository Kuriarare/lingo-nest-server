import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './upload-files.service';
import { UsersRepository } from 'src/users/users.repository';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const uploadResult = await this.s3Service.uploadFile(file);
      const updatedUser = await this.usersRepository.updateUserProfileImage(
        userId,
        uploadResult.url,
      );
      return {
        message: 'File uploaded successfully and user profile updated',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        'Error uploading file and updating user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat-upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadChatFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const allowedMimeTypes = [
      'image/jpeg', // .jpg, .jpeg
      'image/png', // .png
      'application/pdf', // .pdf
      'audio/mpeg', // .mp3
      'audio/wav', // .wav
      'text/plain', // .txt
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'video/mp4', // .mp4
      'audio/mp3', // .mp3
      'video/x-msvideo', // .avi
      'video/quicktime', // .mov
      'application/zip', // .zip (for compressed files)
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'File type not supported',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const uploadResult = await this.s3Service.uploadChatFile(file);
      return {
        message: 'File uploaded successfully',
        fileUrl: uploadResult.url,
      };
    } catch (error) {
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
