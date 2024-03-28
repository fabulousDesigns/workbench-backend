import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Task } from "./task.entity";

@Entity("team")
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // This is a column in the database
  name: string;

  @ManyToMany(() => User, (user) => user.teams)
  users: User[];

  @OneToMany(() => Task, (task) => task.team)
  tasks: Task[];
}
