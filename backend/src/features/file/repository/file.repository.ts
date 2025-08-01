import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractRepository } from '@/database';
import { FileDocument } from '../schemas/file.entity';

@Injectable()
export class FileRepository extends AbstractRepository<FileDocument> {
  protected readonly logger = new Logger(FileRepository.name);

  constructor(
    @InjectModel(FileDocument.name)
    protected readonly fileModel: Model<FileDocument>,
  ) {
    super(fileModel);
  }

  async findOneAndUpdateWithOptions(
    filterQuery: FilterQuery<FileDocument>,
    update: UpdateQuery<FileDocument>,
    options: QueryOptions = {},
  ): Promise<FileDocument> {
    const doc = await this.fileModel
      .findOneAndUpdate(filterQuery, update, { ...options, new: true })
      .lean()
      .exec();

    if (!doc) {
      this.logger.warn(
        `findOneAndUpdateWithOptions error. Filter: ${JSON.stringify(
          filterQuery,
        )}`,
      );
      throw new NotFoundException('The document was not found');
    }

    return doc as FileDocument;
  }
}
