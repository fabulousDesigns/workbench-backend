import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import cron from 'node-cron';
// import { TaskOverdueService } from "./TaskOverdueService";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
//! Always Mark Task as Overdue when dateDue lapses:
// Get the TaskOverdueService instance from the app instance
  // const taskOverdueService = app.get(TaskOverdueService);
  // // Schedule the cron job to run the markOverdueTasks method every day at midnight
  // cron.schedule('0 0 * * *', async () => {
  //   await taskOverdueService.markOverdueTasks();
  // });
  await app.listen(process.env.PORT || 4001, () => {
    Logger.log(`Server started on http://localhost:4001", "Bootstrap`);
  });
}
bootstrap();
