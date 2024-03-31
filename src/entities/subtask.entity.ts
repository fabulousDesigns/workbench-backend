import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Task } from "./task.entity";

@Entity("subtask")
export class Subtask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Task, (task) => task.subtasks)
  task: Task;

  @Column({default: null})
  dueDate: Date;

  @ManyToMany(() => User, (user) => user.subtasks)
  @JoinTable()
  users: User[];
}
