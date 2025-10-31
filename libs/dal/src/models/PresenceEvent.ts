import { ObjectId } from 'mongodb';
import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  ObjectIdColumn,
} from 'typeorm';

@Entity('presence_events')
export class PresenceEvent {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  @Index()
  userId!: string;

  @Column()
  event!: string;

  @Column({ nullable: true })
  eta?: number;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn()
  timestamp!: Date;
}
