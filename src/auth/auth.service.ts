import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Subtask } from "src/entities/subtask.entity";
import { Task } from "src/entities/task.entity";
import { Team } from "src/entities/team.entity";
import { User } from "src/entities/user.entity";
import { AuthPayload } from "src/utils/auth.dto";
import { Repository } from "typeorm";

const users = [
  {
    id: 1,
    username: "john",
    email: "j@gmail.com",
    password: "12345678",
  },
  {
    id: 2,
    username: "chris",
    email: "c@gmail.com",
    password: "cwcwccwcvev",
  },
];

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
  validateUser({ email, password }: AuthPayload) {
    const findUser = users.find(
      (user) => user.email === email && user.password === password
    );
    if (!findUser) {
      return null;
    }
    if (password === findUser.password) {
      const { password, ...result } = findUser;
      const access_token = this.jwtService.sign(result);
      return {
        ...result,
        access_token,
      };
    }
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
  async assignTaskToUser(taskId: number, userId: number): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["users"],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
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
    task.assignedBy = "admin";
    try {
      await this.taskRepository.save(task);
      return {
        statusCode: 200,
        msg: "Task assigned to user successfully!",
      };
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
}
