import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const isCsv = file.mimetype === 'text/csv';
        cb(
          isCsv
            ? null
            : new HttpException(
                'Only CSV files are allowed!',
                HttpStatus.BAD_REQUEST,
              ),
          isCsv,
        );
      },
    }),
  )
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    this.validateFile(file); // Check if the file is present

    const parsedData = await this.uploadService.uploadCsv(file.buffer); // Call the service to handle the upload

    return {
      status: 'success',
      data: parsedData,
    };
  }

  // Helper method to validate the uploaded file
  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
  }
}
