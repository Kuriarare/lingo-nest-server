import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['authorization'].split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = process.env.JWT_SECRET;
      const user = this.jwtService.verify(token, { secret });
      user.exp = new Date(user.exp * 1000);
      user.iat = new Date(user.iat * 1000);

      user.roles = user.isAdmin ? ['admin'] : ['user'];

      request.user = user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
