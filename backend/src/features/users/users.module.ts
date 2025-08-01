import { Module } from '@nestjs/common';
import { UserDocument, UserSchema } from './schemas/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@/database';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [
      ConfigModule,
        DatabaseModule,
        DatabaseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
