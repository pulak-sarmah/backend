import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { DatabaseService } from 'src/database/database.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    UserService,
    UserResolver,
    DatabaseService,
    AuthGuard,
    JwtService,
  ],
})
export class UserModule {}
