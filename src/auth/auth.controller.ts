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
  @Get("team/:teamId/tasks")
  getTasksAndSubtasksByTeam(@Param("teamId") teamId: number) {
    return this.authService.getTasksAndSubtasksByTeam(teamId);
  }
  //! -> Assign a Task to a User
  @Post("assignTask")
  async assignTaskToUser(
    @Body("taskId") taskId: number,
    @Body("userId") userId: number
  ) {
    const result = await this.authService.assignTaskToUser(taskId, userId);
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
}
