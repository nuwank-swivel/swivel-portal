import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
@Entity('bookings')
@Index(['bookingDate', 'userId'])
export class Booking {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  userId!: string;

  @Column()
  bookingDate!: string; // YYYY-MM-DD format

  @Column()
  durationType!: 'hour' | 'half-day' | 'full-day';

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  lunchOption?: string;

  @Column({ nullable: true })
  canceledAt?: Date | null;

  @Column({ nullable: true })
  canceledBy?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
