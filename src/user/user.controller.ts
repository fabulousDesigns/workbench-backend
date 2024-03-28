import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/utils/createUser.dto";
import { User } from "src/entities/user.entity";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //====================================================================================================================
  //! This method is used to create a new user.
  //====================================================================================================================
  @UsePipes(ValidationPipe)
  @Post("register")
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }
}
