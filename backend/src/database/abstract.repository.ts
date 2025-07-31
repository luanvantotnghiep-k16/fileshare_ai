//https://blog.stackademic.com/how-to-create-paginated-sortable-and-filterable-endpoints-with-nestjs-fde6315c8466
//{{base_api}}/category/search?sort=name:desc&pageIndex=1&pageSize=2&filters=[{"field":"name", "rule": "regex","value":"loai"}]
/*
We define an abstract class AbstractRepository with a generic type TDocument that extends Document.

The repository provides common CRUD functionality, such as create, findOne, findOneAndUpdate, find, and findOneAndDelete.

We utilize the lean(true) method to retrieve plain JavaScript objects, reducing the overhead of Mongoose's hydrated documents.
*/
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import IPagedList from './ipaged-list';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {
    this.logger = new Logger(model.modelName);
  }
  async aggregate(pipeline: any[]): Promise<TDocument[]> {
    return this.model.aggregate(pipeline).exec() as Promise<TDocument[]>;
  }

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    const savedDocument = await createdDocument.save();
    return savedDocument.toJSON() as unknown as TDocument;
  }

  async createMany(documents: Omit<TDocument, '_id'>[]): Promise<TDocument[]> {
    const createdDocuments = documents.map(
      (document) =>
        new this.model({
          ...document,
          _id: new Types.ObjectId(),
        }),
    );

    const savedDocuments = await Promise.all(
      createdDocuments.map((doc) => doc.save()),
    );
    return savedDocuments.map((doc) => doc.toJSON() as unknown as TDocument);
  }

  async executeCommand(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean(true)) as TDocument;
    return document;
  }
  async updateManyDocuments(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<number> {
    // Returning number of updated documents instead of a single document
    const result = await this.model.updateMany(filterQuery, update);

    if (result.matchedCount === 0) {
      // Check if any documents matched the filterQuery
      this.logger.warn(
        `updateManyDocuments. \n No documents matched with filter query: ${JSON.stringify(filterQuery)}.`,
      );
      throw new NotFoundException('No documents were found to update');
    }

    this.logger.log(
      `Successfully updated ${result.modifiedCount} documents with filter query: ${JSON.stringify(filterQuery)}.`,
    );

    return result.modifiedCount; // Return the count of modified documents
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `findOneAndUpdate. \n Document not found with filter query: ${JSON.stringify(filterQuery)}.`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }
  //support multi filter and single order
  async search<TResult = TDocument>(
    filterQuery: FilterQuery<TDocument> = {},
    paginationParams: { page?: number; limit?: number } = {},
    sortParams: {
      field: string;
      direction: -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending';
    }[] = [],
    populateFields?: { path: string; select?: string }[],
    transform?: (doc: TDocument) => TResult,
    projection?: string | Record<string, unknown>,
  ): Promise<IPagedList<TResult>> {
    // 1. pull page & limit, defaulting page to 1; leave limit undefined
    const { page = 1, limit } = paginationParams;

    // 2. build your sort logic (unchanged) …
    let sort: Record<string, any> = {};
    if (sortParams.length > 0) {
      sort = Object.fromEntries(
        sortParams.map(({ field, direction }) => [field, direction]),
      );
    } else {
      // … your updatedAt/createdAt/_id fallback
    }

    // 3. start the query
    let query = this.model.find(filterQuery, projection).sort(sort).lean(true);

    // 4. only apply skip/limit if limit was passed in
    if (typeof limit === 'number') {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    // 5. handle populate (unchanged) …
    if (populateFields) {
      for (const field of populateFields) {
        query = query.populate({
          path: field.path,
          select: field.select,
          match: { _id: { $exists: true } },
          options: { strictPopulate: false },
        });
      }
    }

    // 6. execute in parallel
    const [totalCount, documents] = await Promise.all([
      this.model.countDocuments(filterQuery),
      query.exec() as Promise<TDocument[]>,
    ]);

    // 7. transform & return, falling back limit→totalCount if undefined
    const docs = transform
      ? documents.map(transform)
      : (documents as unknown as TResult[]);

    return {
      documents: docs,
      totalCount,
      limit: typeof limit === 'number' ? limit : totalCount,
      page: totalCount === 0 ? 0 : page,
    };
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    projection?: string | Record<string, unknown>,
    populateFields?: { path: string; select?: string }[],
    sort?: Record<string, 1 | -1>,
  ): Promise<TDocument[]> {
    let query = this.model.find(filterQuery, projection).lean(true);
    if (populateFields) {
      for (const field of populateFields) {
        query = query.populate(field.path, field.select);
      }
    }
    if (sort) {
      query = query.sort(sort);
    }
    return query.exec() as Promise<TDocument[]>;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projection?: string | Record<string, unknown>,
    populateFields?: { path: string; select?: string }[],
  ): Promise<TDocument | null> {
    let query = this.model.findOne(filterQuery, projection).lean(true);

    if (populateFields) {
      for (const field of populateFields) {
        query = query.populate(field.path, field.select);
      }
    }

    // 1) await the exec() so `document` is TDocument | null, not a Promise
    const document = (await query.exec()) as TDocument | null;

    // 2) now it makes sense to check for null
    if (!document) {
      this.logger.warn(
        `findOne. Document not found with filter: ${JSON.stringify(filterQuery)}`,
      );
      return null;
    }

    return document;
  }

  // async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument | null> {
  //   const document = (await this.model
  //     .findOne(filterQuery)
  //     .lean(true)) as TDocument;
  //   if (!document) {
  //     this.logger.warn(`findOne. \n Document not found with filter query: ${JSON.stringify(filterQuery)}`);
  //     return null;
  //     //throw new NotFoundException('The document was not found');
  //   }
  //   return document;
  // }
  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndDelete(filterQuery)
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  async findManyAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteMany(filterQuery).exec();
    if (result.deletedCount === 0) {
      this.logger.warn(
        `No documents found to delete with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('No documents were found to delete');
    }
    return result;
  }
}
