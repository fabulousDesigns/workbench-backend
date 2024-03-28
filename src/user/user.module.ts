import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "src/entities/user.entity";
import { Team } from "src/entities/team.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
