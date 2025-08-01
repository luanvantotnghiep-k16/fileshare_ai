
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
   // Explicitly select password field for authentication
   return await this.userRepository.findOne({ email }, '+password');
  }
  async findById(id: string): Promise<UserDocument | null> {
    return await this.userRepository.findOne({ _id: id });
  }

  async updateName(id: string, firstName: string, lastName: string): Promise<UserDocument | null> {
    return this.userRepository.findOneAndUpdateWithOptions(
      { _id: id },
      { firstName, lastName },
      { new: true }
    );
  }

  async changePassword(id: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    const user = await this.userRepository.findOne({ _id: id });
    if (!user) throw new BadRequestException('User not found');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new BadRequestException('Current password is incorrect');
    if (newPassword !== confirmPassword) throw new BadRequestException('Passwords do not match');
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.userRepository.findOneAndUpdateWithOptions(
      { _id: id },
      { password: hashed },
      { new: true }
    );
  }

  async searchEmails(query: string): Promise<UserDocument[]> {
    return this.userRepository.find({ email: { $regex: query, $options: 'i' } });
  }
}
