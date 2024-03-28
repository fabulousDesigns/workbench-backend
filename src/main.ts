import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
  await app.listen(process.env.PORT || 4001, () => {
    Logger.log(`Server started on http://localhost:4001", "Bootstrap`);
  });
}
bootstrap();
