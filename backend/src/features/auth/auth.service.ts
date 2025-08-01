import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/features/users/users.service'
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@/features/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user: hashes the password then delegates to UsersService.
   */
  async register(dto: CreateUserDto) {
    return await this.usersService.createUser(dto);
  }

  /**
   * Validates a user's credentials.
   * Throws UnauthorizedException if invalid.
   */
  async validateUser(email: string, plainPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {_id} = user;
    return { email: user.email, _id }; // Return only necessary fields
  }

  /**
   * Issues a JWT for a validated user.
   * Expects validateUser to be called first.
   */
  login(user: { email: string; _id: string }) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload, {
         secret:  process.env.JWT_SECRET || 'defaultsecret',
        expiresIn:  '1d', //30m
      }),
    };
  }
}
