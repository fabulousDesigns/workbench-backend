import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Team } from "src/entities/team.entity";
import { User } from "src/entities/user.entity";
import { CreateUserDto } from "src/utils/createUser.dto";
import { In, Repository } from "typeorm";
import * as argon2 from "argon2";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Team) private teamRepository: Repository<Team>
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { name, email, password, teams } = createUserDto;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await argon2.hash(password);
    user.teams = await this.teamRepository.find({
      where: { id: In(teams) },
    });
    const newUser = this.userRepository.create(user);
    try {
      await this.userRepository.save(newUser);
      return {
       statusCode: 201,
       msg: "Account created successfully",
      };
    } catch (error) {
      if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
        throw new HttpException("Email already exists", 409);
      }
    }
  }
}
