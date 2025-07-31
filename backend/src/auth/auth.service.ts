import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
    const saltRounds = 12;
    const hashed = await bcrypt.hash(dto.password, saltRounds);
    return this.usersService.create({
      ...dto,
      password: hashed,
    });
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

    // Remove the password field before returning
    const { password: _pwd, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  /**
   * Issues a JWT for a validated user.
   * Expects validateUser to be called first (e.g. in the AuthController).
   */
  async login(user: { email: string; _id: string }) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
