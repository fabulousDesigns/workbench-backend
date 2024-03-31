import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
// import { TaskOverdueService } from "./TaskOverdueService";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "12345678",
      database: process.env.DB_NAME || "workbench",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true,
      // logging: true,
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // exports: [TaskOverdueService]
})
export class AppModule {}
