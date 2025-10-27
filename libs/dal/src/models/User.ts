import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  azureAdId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  teamId?: string; // team the user is a member of

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
