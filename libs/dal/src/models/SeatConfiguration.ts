import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('seatConfigurations')
export class SeatConfiguration {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  defaultSeatCount!: number;

  @Column({ nullable: true })
  modifiedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  lastModified!: Date;
}
