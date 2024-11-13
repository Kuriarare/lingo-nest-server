import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.development' });

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('AWS_BUCKET_NAME');
    const region = this.configService.get('AWS_REGION');
    const folderPrefix = 'avatar-images/';
    const fileKey = `${folderPrefix}${file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error al subir archivo a S3');
    }
  }

  async uploadChatFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('AWS_BUCKET_NAME');
    const region = this.configService.get('AWS_REGION');
    const folderPrefix = 'chat-uploads/';
    const fileKey = `${folderPrefix}${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error uploading file to S3');
    }
  }
}
