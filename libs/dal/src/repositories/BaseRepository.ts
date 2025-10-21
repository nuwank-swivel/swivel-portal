import { MongoRepository, FindOptionsWhere } from 'typeorm';
import { ObjectId } from 'mongodb';
import { AppDataSource } from '../db/typeormDataSource.js';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export class BaseRepository<T extends { _id?: ObjectId }> {
  protected repository: MongoRepository<T>;

  constructor(entity: { new (): T }) {
    this.repository = AppDataSource.getMongoRepository(entity);
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { _id: new ObjectId(id) } as FindOptionsWhere<T>,
    });
  }

  async create(item: Omit<Partial<T>, '_id'>): Promise<T> {
    const result = await this.repository.save(item as T);
    return result;
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    await this.repository.update(
      { _id: new ObjectId(id) } as FindOptionsWhere<T>,
      item as QueryDeepPartialEntity<T>
    );
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({
      _id: new ObjectId(id),
    } as FindOptionsWhere<T>);
    return !!result.affected && result.affected > 0;
  }
}
