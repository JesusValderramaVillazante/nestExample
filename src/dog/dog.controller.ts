import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateDogDto } from './create-dog.dto';
import { DogService } from './dog.service';
import { Dog } from './dog.interface';

@Controller('dog')
export class DogController {
    constructor(private readonly dogsService: DogService) {}
    @Post()
    async create(@Body() createDogDto: CreateDogDto) {
        await this.dogsService.create(createDogDto);
    }

    @Get()
    async findAll(): Promise<Dog[]> {
        return this.dogsService.findAll();
    }
}
