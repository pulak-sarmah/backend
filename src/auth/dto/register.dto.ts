import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  fullName: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      ' Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Confirm password must match the password' })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}
