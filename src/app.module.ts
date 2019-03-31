import { Module } from '@nestjs/common';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './services/cats.service';

@Module({
  imports: [],
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}


