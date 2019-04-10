import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Dog } from './dog.interface';
import { CreateDogDto } from './create-dog.dto';

@Injectable()
export class DogService {
    constructor(@InjectModel('Dog') private readonly dogModel: Model<Dog>) { }
    
    async create(createDogDto: CreateDogDto): Promise<Dog> {
        console.log(createDogDto);
        const createdDog = new this.dogModel(createDogDto);
        return await createdDog.save();
    }

    async findAll(): Promise<Dog[]> {
        return await this.dogModel.find().exec();
    }
}