import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchema, UserDocument } from './schemas/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UsersService {

  constructor(
    private readonly userRepository: UserRepository,

  ) {}

  /**
   * Creates a new user.
   * - Validates password confirmation.
   * - Hashes the password.
   * - Persists the user.
   * - Returns the saved user without the password field.
   */

  async createUser(
    createCustomerDto: CreateUserDto   
  ): Promise<UserDocument> {   
   const { firstName, lastName, email, password, confirmPassword } =
      createCustomerDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existing = await this.userRepository.findOne({ email });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user ={
      firstName,
      lastName,
      email,
      password: hashed,
    } as unknown as UserDocument;
    return await this.userRepository.create(user);
  }

  /**
   * Finds a user by email.
   * Returns the full Document so callers can
   * compare passwords, then strip sensitive fields.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
   return await this.userRepository.findOne({ email });
  }

}
