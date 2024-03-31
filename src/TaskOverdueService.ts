import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { Subtask } from "./entities/subtask.entity";

export class TaskOverdueService {
  constructor(
   @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,    
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  async markOverdueTasks(): Promise<void> {
    const currentDate = new Date();

    // Mark overdue tasks
    const overdueTasks = await this.taskRepository.find({
      where: {
        status: 'inprogress',
        dueDate: LessThan(currentDate),
      },
    });

    for (const task of overdueTasks) {
      task.status = 'overdue';
      await this.taskRepository.save(task);
    }

    // Mark overdue subtasks
    const overdueSubtasks = await this.subtaskRepository.find({
      where: {
        dueDate: LessThan(currentDate),
      },
      relations: ['task'],
    });

    for (const subtask of overdueSubtasks) {
      subtask.task.status = 'overdue';
      await this.taskRepository.save(subtask.task);
    }
  }
}
