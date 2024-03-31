import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./Guards/local.guard";
import { Request } from "express";
import { JwtAuthGuard } from "./Guards/jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalGuard)
  @Post("login")
  login(@Req() req: Request) {
    return req.user;
  }
  @Get("usernames")
  async getAllUsernames(): Promise<any> {
    return this.authService.getAllUsernames();
  }
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    return req.user;
  }
  @Post("createTask")
  createTask(@Req() req: Request) {
    return this.authService.createTask(req.body.name, req.body.teamId);
  }
  //subtask
  @Post("createSubtask")
  createSubtask(@Req() req: Request) {
    return this.authService.createSubtask(req.body.name, req.body.taskId);
  }
  //Get all tasks
  @Get("tasks")
  getAllTasks() {
    return this.authService.getAllTasks();
  }
  // Update Task Status
  @Post("updateTaskStatus")
  updateTaskStatus(@Req() req: Request) {
    const update = this.authService.updateTaskStatus(
      req.body.taskId,
      req.body.status
    );
    try {
      return update;
    } catch (error) {
      throw new InternalServerErrorException("Error updating task status");
    }
  }
  //Get subtasks
  @Get("subtasks")
  getAllSubtasks() {
    return this.authService.getAllSubtasks();
  }

  @Get("team/tasks/:teamId")
  getTasksAndSubtasksByTeam(@Param("teamId") teamId: number) {
    return this.authService.getTasksAndSubtasksByTeam(teamId);
  }
  //! -> Assign a Task to a User
  @UseGuards(JwtAuthGuard)
  @Post("assignTask")
  async assignTaskToUser(
    @Body("taskId") taskId: number,
    @Body("userId") userId: number,
    @Req() req: Request & { user: { name: string } } // Update the type of req.user
  ) {
    const result = await this.authService.assignTaskToUser(
      taskId,
      userId,
      req.user.name
    );
    return result;
  }
  //! -> Unassign Task
  @Post("unassignTask")
  async unassignTaskFromUser(
    @Body("taskId") taskId: number,
    @Body("userId") userId: number
  ) {
    const result = await this.authService.unassignTaskFromUser(taskId, userId);
    return result;
  }

  @Get("teams")
  getAllTeams() {
    return this.authService.getAllTeams();
  }
  //! Count all Tasks that belongs to a team
  @Get("team/task/:teamId")
  async countTasksByTeam(@Param("teamId") teamId: number) {
    return this.authService.countTasksByTeam(teamId);
  }
  //! Count all SubTasks that belongs to a team
  @Get("team/subtask/:teamId")
  async countSubtasksByTeam(@Param("teamId") teamId: number) {
    return this.authService.countSubtasksByTeam(teamId);
  }
  //! Count all Users that belongs to a team
  @Get("team/users/:teamId")
  async countUsersByTeam(@Param("teamId") teamId: number) {
    return this.authService.countUsersByTeam(teamId);
  }
  // ! Get all users in a team by team ID
  @Get("team/allusers/:teamId")
  async getUsersByTeam(@Param("teamId") teamId: number) {
    return this.authService.getUsersByTeam(teamId);
  }
  //! Count Contributors to a tasks by counting all users that are assigned to a tasks' subtasks and the user assigned to the task
  @Get("task/contributors/:taskId")
  async countContributorsToTask(@Param("taskId") taskId: number) {
    return this.authService.countContributors(taskId);
  }
}
