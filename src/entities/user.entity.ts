import {
  Entity, // 👈 import the Entity decorator
  PrimaryGeneratedColumn, // 👈 import the PrimaryGeneratedColumn decorator
  Column, // 👈 import the Column decorator
  ManyToMany, // 👈 import ManyToMany
  JoinTable,
  Unique, // 👈 import the JoinTable decorator
} from "typeorm";
import { Team } from "./team.entity"; // 👈 import Team
import { UserRole } from "src/utils/role.enum"; // 👈 import UserRole
import { Subtask } from "./subtask.entity";
import { Task } from "./task.entity";
@Unique(["email"]) // 👈 pass the column name to the Unique decorator
@Entity("user") // 👈 pass the table name to the Entity decorator
export class User {
  @PrimaryGeneratedColumn() // 👈 add the PrimaryGeneratedColumn decorator
  id: number;
  
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
  @ManyToMany(() => Team, (team) => team.users)
  @JoinTable()
  teams: Team[];

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @ManyToMany(() => Task, (task) => task.users)
  tasks: Task[];

  @ManyToMany(() => Subtask, (subtask) => subtask.users)
  subtasks: Subtask[];

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
