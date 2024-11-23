import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.usersService.findAll();
  }

  @Post('assignstudent')
  @HttpCode(HttpStatus.OK)
  assignStudent(@Body() body: any) {
    return this.usersService.assignStudent(body);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Post('updateuser')
  @HttpCode(HttpStatus.OK)
  async update(@Body() updateUser: any) {
    const updatedUser = await this.usersService.update(updateUser);
    console.log(updatedUser);
    return updatedUser;
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  remove(@Body() body: any) {
    const { email } = body;
    return this.usersService.remove(email);
  }

  @Post('removeStudentsFromTeacher')
  @HttpCode(HttpStatus.OK)
  removeStudentsFromTeacher(@Body() body: any) {
    console.log(body);
    return this.usersService.removeStudentsFromTeacher(body);
  }

  @Patch('modify-schedule')
  @HttpCode(HttpStatus.OK)
  async modifySchedule(@Body() body: any) {
    return this.usersService.modifySchedule(body);
  }
}
