import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { FeaturesModule } from './features/features.module';
import { DatabaseModule } from './database';

const envModule = ConfigModule.forRoot({
  envFilePath:
    process.env.NODE_ENV === 'development'
      ? ['.env.local', '.env.development']
      : ['.env'],
  load: [configuration],
  isGlobal: true,
});

@Module({
  imports: [envModule, FeaturesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
