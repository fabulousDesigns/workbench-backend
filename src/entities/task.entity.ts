import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Team } from "./team.entity";
import { Subtask } from "./subtask.entity";

@Entity("task")
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: "inprogress" })
  status: string;

  @Column({ default: false })
  isAssigned: boolean;

  @ManyToOne(() => User)
  assignedTo: User;

  @Column({ default: "null" })
  assignedBy: string;

  @ManyToOne(() => Team, (team) => team.tasks)
  team: Team;

  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subtasks: Subtask[];

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  users: User[];
}
