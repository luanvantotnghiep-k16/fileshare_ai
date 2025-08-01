import { Controller, Get, Put, Body, Request, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return await this.usersService.findById(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('name')
  async updateName(@Request() req, @Body() body: { firstName: string; lastName: string }) {
    return this.usersService.updateName(req.user._id, body.firstName, body.lastName);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return this.usersService.changePassword(req.user._id, body.currentPassword, body.newPassword, body.confirmPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search-emails')
  async searchEmails(@Query('q') query: string) {
    return await this.usersService.searchEmails(query);
  }
}
