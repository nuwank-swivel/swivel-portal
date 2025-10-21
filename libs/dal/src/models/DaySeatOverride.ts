import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('daySeatOverrides')
@Index(['date'], { unique: true })
export class DaySeatOverride {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  date!: string;

  @Column()
  seatCount!: number;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
