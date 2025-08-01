import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractRepository } from '@/database';
import { UserDocument } from '../schemas';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  // /**
  //  * Finds a user by _id using Mongoose's findById.
  //  */
  // async findById(id: string, projection?: any): Promise<UserDocument | null> {
  //   return this.userModel.findById(id, projection).exec();
  // }
  // protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  /**
   * Finds one document and updates it, allowing you to pass
   * full QueryOptions (arrayFilters, upsert, etc.).
   * Returns the updated doc or throws NotFoundException.
   */
  async findOneAndUpdateWithOptions(
    filterQuery: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    options: QueryOptions = {},
  ): Promise<UserDocument> {
    // Note: `new: true` makes findOneAndUpdate return the _updated_ doc
    const doc = await this.userModel
      .findOneAndUpdate(filterQuery, update, { ...options, new: true })
      .lean() // returns a plain JS object
      .exec(); // gives TS a real Promise<T>

    if (!doc) {
      this.logger.warn(
        `findOneAndUpdateWithOptions error. Filter: ${JSON.stringify(
          filterQuery,
        )}`,
      );
      throw new NotFoundException('The document was not found');
    }

    return doc as UserDocument;
  }
}
