import { Entity, ObjectIdColumn, Column, Index, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('meal_notification_settings')
@Index(['userId'])
export class MealNotificationSettings {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  userId!: string;

  @Column({ default: false })
  receiveDailyEmail!: boolean;

  @Column({ nullable: true })
  preferredTimeUTC?: string | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}


