import { IsNotEmpty, IsString } from "class-validator";

export class AuthPayload {
  // @IsString({ message: 'Username must be a string' })
  // @IsNotEmpty({ message: 'Username is required' })
  email: string;
  // @IsString({ message: 'Password must be a string' })
  // @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
