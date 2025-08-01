import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileDocument, FileSchema } from './schemas/file.entity';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { DatabaseModule } from '@/database';
import { ConfigModule } from '@nestjs/config';
import { FileRepository } from './repository/file.repository';

@Module({
   imports: [
        ConfigModule,
          DatabaseModule,
          DatabaseModule.forFeature([{ name: FileDocument.name, schema: FileSchema }]),
    ],


  providers: [FileRepository, FileService],
  controllers: [FileController],
  exports: [FileRepository, FileService],
})
export class FileModule {}
