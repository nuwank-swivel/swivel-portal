import { Entity, ObjectIdColumn, Column, Index, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('meal_notification_settings')
@Index(['userEmail'])
export class MealNotificationSettings {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  userEmail!: string;

  @Column({ nullable: true })
  preferredTimeUTC?: string | null;

  @Column({ nullable: true })
  addedBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}


