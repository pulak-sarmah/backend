import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}
  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    let payload: {
      sub: string;
      iat?: number;
      exp?: number;
    };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userExists = await this.databaseService.user.findUnique({
      where: { id: parseInt(payload.sub) },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }
    const expiresIn = 30000;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      },
    );
    res.cookie('access-token', accessToken, { httpOnly: true });
    return accessToken;
  }

  private async issueTokens(user: User, res: Response) {
    const payload = { username: user.fullName, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '150sec',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    res.cookie('access_token', accessToken, { httpOnly: true });
    res.cookie('refresh_token', refreshToken, { httpOnly: true });
    return { user };
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: loginDto.email },
    });

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (user && isPasswordValid) {
      return { ...user, password: undefined };
    } else {
      return null;
    }
  }

  async register(registerDto: RegisterDto, response: Response) {
    const userExists = await this.databaseService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.databaseService.user.create({
      data: {
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    return this.issueTokens(user, response);
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user, response);
  }

  async logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }
}
