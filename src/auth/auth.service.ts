import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Subtask } from "src/entities/subtask.entity";
import { Task } from "src/entities/task.entity";
import { Team } from "src/entities/team.entity";
import { User } from "src/entities/user.entity";
import { AuthPayload } from "src/utils/auth.dto";
import { Repository } from "typeorm";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>
  ) {}
  //====================================================================================================================
  //! This method is used to validate the user. If the user is found, it returns the user's details and an access token.
  //====================================================================================================================
  async validateUser({ email, password }: AuthPayload) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["teams"],
    });
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }
    const { password: _, ...result } = user;
    const access_token = this.jwtService.sign(result);
    // Handle the case when the user has no associated teams
    const teamIds = user.teams ? user.teams.map(({ id }) => id) : [];
    const teams = await this.teamRepository.findByIds(teamIds);
    const assignedTasks = await this.taskRepository.find({
      relations: ["team", "team.users", "assignedTo"],
      where: {
        team: {
          users: {
            id: user.id,
          },
        },
        assignedTo: {
          id: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        isAssigned: true,
        assignedBy: true,
        team: {
          id: true,
          name: true,
          users: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          id: true,
          name: true,
        },
      },
    });

    const assignedSubtasks = await this.subtaskRepository.find({
      relations: ["task", "task.team", "task.team.users", "users"],
      where: {
        task: {
          team: {
            users: {
              id: user.id,
            },
          },
        },
        users: {
          id: user.id,
        },
      },
    });

    return {
      ...result,
      access_token,
      teams,
      assignedTasks,
      assignedSubtasks,
    };
  }
  //***************************************************************************************************** */
  //! -> create a new task
  //***************************************************************************************************** */

  async createTask(name: string, teamId: number): Promise<Task> {
    const task = new Task();
    task.name = name;
    task.team = await this.teamRepository.findOne({ where: { id: teamId } });
    return this.taskRepository.save(task);
  }
  //***************************************************************************************************** */
  //! -> Update Task Status
  //***************************************************************************************************** */
  async updateTaskStatus(taskId: number, status: string): Promise<any> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    task.status = status;
    try {
      await this.taskRepository.save(task);
      return {
        statusCode: 200,
        msg: "Task status updated successfully!",
      };
    } catch (error) {
      throw new ForbiddenException("Error updating task status");
    }
  }
  // Get ALL Teams
  async getAllTeams(): Promise<Team[]> {
    return this.teamRepository.find();
  }

  //***************************************************************************************************** */
  //! -> Get all tasks
  //***************************************************************************************************** */
  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.find();
  }
  //***************************************************************************************************** */
  //! ->  Get All Users
  //***************************************************************************************************** */
  async getAllUsernames(): Promise<{ id: number; name: string }[]> {
    const users = await this.userRepository.find({ select: ["id", "name"] });
    return users;
  }
  //***************************************************************************************************** */
  //! -> subtask (CREATE)
  //***************************************************************************************************** */
  async createSubtask(name: string, taskId: number): Promise<Subtask> {
    const subtask = new Subtask();
    subtask.name = name;
    subtask.task = await this.taskRepository.findOne({ where: { id: taskId } });
    return this.subtaskRepository.save(subtask);
  }
  //***************************************************************************************************** */
  //! -> Get all subtasks
  //***************************************************************************************************** */
  async getAllSubtasks(): Promise<Subtask[]> {
    return this.subtaskRepository.find();
  }
  //***************************************************************************************************** */
  //! -> Get Taks & subtasks for a Team
  //***************************************************************************************************** */

  async getTasksAndSubtasksByTeam(teamId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { team: { id: teamId } },
      relations: ["subtasks"],
    });
  }
  //***************************************************************************************************** */
  //! -> Assign a Task to a User
  //***************************************************************************************************** */
  async assignTaskToUser(
    taskId: number,
    userId: number,
    assignedBy: string
  ): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["users"],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found.`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (task.isAssigned) {
      throw new ConflictException("Task is already assigned to a user!");
    }

    if (!task.users) {
      task.users = [];
    }

    if (!task.users.some((u) => u.id === user.id)) {
      task.users.push(user);
    }

    task.isAssigned = true;
    task.assignedTo = user;
    task.assignedBy = assignedBy;

    try {
      await this.taskRepository.save(task);
      return { statusCode: 200, msg: "Task assigned to user successfully!" };
    } catch (error) {
      throw new ForbiddenException("Error assigning task to user!");
    }
  }

  // ! Unassign Task
  async unassignTaskFromUser(taskId: number, userId: number): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["users"],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!task.users) {
      return {
        msg: "Task is not assigned to any user!",
      };
    }
    task.users = task.users.filter((u) => u.id !== user.id);
    if (task.users.length === 0) {
      task.isAssigned = false;
      task.assignedTo = null;
      task.assignedBy = null;
    }
    await this.taskRepository.save(task);
    return {
      msg: "Task unassigned from successfully!",
    };
  }
  //***************************************************************************************************** */
  //! -> Get all tasks for a user
  //***************************************************************************************************** */
  async getTasksForUser(userId: number): Promise<Task[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["tasks"],
    });
    return user.tasks;
  }
  //! Count all Tasks that belongs to a team
  async countTasksByTeam(teamId: number): Promise<number> {
    return this.taskRepository.count({ where: { team: { id: teamId } } });
  }
  //! Count all SubTasks that belongs to a team
  async countSubtasksByTeam(teamId: number): Promise<number> {
    return this.subtaskRepository.count({
      where: { task: { team: { id: teamId } } },
    });
  }
  //! Count all Users that belongs to a team
  async countUsersByTeam(teamId: number): Promise<number> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ["users"],
    });
    return team.users.length;
  }
  // ! Get all users in a team by team ID and dont display password
  async getUsersByTeam(teamId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { teams: { id: teamId } },
      select: ["id", "name", "email", "role", "isActive"],
    });
  }
  //! -> Get all tasks that belongs to a Team
  async getTasksByTeam(teamId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { team: { id: teamId } },
    });
  }
  //! Count Contributors to a tasks by counting all users that are assigned to a tasks' subtasks and the user assigned to the task
  async countContributors(taskId: number): Promise<number> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["subtasks", "assignedTo"],
    });
    if (!task) {
      // Handle case when task is not found
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
    const subtaskUsers = task.subtasks.reduce((acc, subtask) => {
      return acc + (subtask.users ? subtask.users.length : 0);
    }, 0);
    return subtaskUsers + (task.assignedTo ? 1 : 0);
  }
}
