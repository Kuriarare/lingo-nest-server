import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { VideoCallsGateway } from 'src/videocalls.gateaway';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersReository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly videoCallsGateway: VideoCallsGateway,
    private readonly mailService: MailService,
  ) {}

  async register(newUser: any) {
    const foundUser = await this.usersReository.findByEmail(newUser.email);
    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const unhasedPassword = newUser.password;

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    await this.usersReository.register({
      ...newUser,
      password: hashedPassword,
    });
    await this.mailService.sendUserWelcomeEmail(
      newUser.name,
      newUser.email,
      unhasedPassword,
    );
    return newUser;
  }

  async login(email: string, password: any) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const foundUser = await this.usersReository.findByEmail(email);
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    foundUser.online = 'online';
    await this.usersReository.save(foundUser);
    this.videoCallsGateway.notifyUserOnline({
      id: foundUser.id,
      name: foundUser.name + ' ' + foundUser.lastName,
    });
    const userPayload = { email: foundUser.email, id: foundUser.id };
    const token = this.jwtService.sign(userPayload);
    return { token, user: foundUser };
  }

  async logout(userId: string) {
    const foundUser = await this.usersReository.findById(userId);

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    foundUser.online = 'offline';
    await this.usersReository.save(foundUser);
    this.videoCallsGateway.notifyUserOffline({
      id: foundUser.id,
      name: foundUser.name + ' ' + foundUser.lastName,
    });
    return foundUser;
  }
}
