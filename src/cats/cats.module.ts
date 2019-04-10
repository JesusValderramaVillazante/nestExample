import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './http.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './cat.entity';
import { UserService } from './user.service';
import { User } from './user.entity';
import { EventsModule } from 'src/events/events.module';


@Module({
  imports: [TypeOrmModule.forFeature([Cat, User]), EventsModule],
  controllers: [CatsController],
  providers: [CatsService, UserService, AuthService, JwtStrategy],
  exports: [CatsService, UserService]
})
export class CatsModule { }