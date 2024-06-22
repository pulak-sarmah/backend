import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gglCtx = context.getArgByIndex(2);
    const req: Request = gglCtx.req;
    const token = this.extractTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedException('No token found');
    }
    try {
      const payload = this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      req['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromCookie(req: Request): string {
    const token = req.cookies['access-token'];
    return token;
  }
}
