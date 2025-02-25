import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { VideoCallsGateway } from 'src/videocalls.gateaway';
import { MailService } from 'src/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UnreadGlobalMessage } from 'src/chat/entities/unread-global-messages.entity';
import { Repository } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.development' });

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly videoCallsGateway: VideoCallsGateway,
    private readonly mailService: MailService,
    @InjectRepository(UnreadGlobalMessage)
    private readonly unReadGlobalMessageRepo: Repository<UnreadGlobalMessage>,
  ) {}

  async register(newUser: any) {
    const foundUser = await this.usersRepository.findByEmail(newUser.email);
    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const unhasedPassword = newUser.password;

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const unsavedReadMessageUser = await this.usersRepository.register({
      ...newUser,
      password: hashedPassword,
    });

    const unreadGlobalMessage = new UnreadGlobalMessage();
    unreadGlobalMessage.user = unsavedReadMessageUser;
    unreadGlobalMessage.randomRoom = 0;
    unreadGlobalMessage.generalEnglishRoom = 0;
    unreadGlobalMessage.teachersEnglishRoom = 0;
    unreadGlobalMessage.generalSpanishRoom = 0;
    unreadGlobalMessage.teachersSpanishRoom = 0;
    unreadGlobalMessage.generalPolishRoom = 0;
    unreadGlobalMessage.teachersPolishRoom = 0;

    await this.unReadGlobalMessageRepo.save(unreadGlobalMessage);

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
    const foundUser = await this.usersRepository.findByEmail(email);
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    foundUser.online = 'online';
    await this.usersRepository.save(foundUser);
    this.videoCallsGateway.notifyUserOnline({
      id: foundUser.id,
      name: foundUser.name + ' ' + foundUser.lastName,
    });
    const userPayload = { email: foundUser.email, id: foundUser.id };
    const token = this.jwtService.sign(userPayload);
    return { token, user: foundUser };
  }

  async logout(userId: string) {
    const foundUser = await this.usersRepository.findById(userId);

    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    foundUser.online = 'offline';
    await this.usersRepository.save(foundUser);
    this.videoCallsGateway.notifyUserOffline({
      id: foundUser.id,
      name: foundUser.name + ' ' + foundUser.lastName,
    });
    return foundUser;
  }

  async forgotPassword(email: string) {
    const foundUser = await this.usersRepository.findByEmail(email);
    if (!foundUser) {
      return { message: 'User not found' };
    }

    const hashSnippet = foundUser.password.slice(-10);
    const secret = process.env.JWT_SECRET;
    const token = this.jwtService.sign(
      { id: foundUser.id, h: hashSnippet },
      { secret: secret, expiresIn: '1h' },
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log('resetUrl', resetUrl);

    await this.mailService.sendUserResetPasswordEmail(
      foundUser.name,
      foundUser.email,
      resetUrl,
    );

    return { message: 'Reset link sent if email exists' };
  }

  async setNewPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let decoded: { id: string; h: string };
    try {
      decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (e) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.usersRepository.findById(decoded.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentHashSnippet = user.password.slice(-10);
    if (currentHashSnippet !== decoded.h) {
      throw new BadRequestException('Token expired');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async verifyResetToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      const user = await this.usersRepository.findById(decoded.id);

      if (!user) {
        throw new BadRequestException('Invalid token');
      }
      const currentHashSnippet = user.password.slice(-10);
      if (currentHashSnippet !== decoded.h) {
        throw new BadRequestException('Token expired');
      }

      return {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error.message === 'jwt expired' ? 'Token expired' : 'Invalid token',
      );
    }
  }
}
