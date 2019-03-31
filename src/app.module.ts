import { Module } from '@nestjs/common';
import { CatsController } from './controllers/cats/cats.controller';

@Module({
  imports: [],
  controllers: [CatsController],
  providers: [],
})
export class AppModule {}


