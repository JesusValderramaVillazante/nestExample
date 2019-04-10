import { Module } from '@nestjs/common';
import { DogController } from './dog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DogSchema } from './dog.schema';
import { DogService } from './dog.service';


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Dog', schema: DogSchema }])],
  controllers: [DogController],
  providers: [DogService],
  exports: [DogService]
})
export class DogModule {}
