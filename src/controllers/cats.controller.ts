import { Controller, Get, Delete, Put, Post, Param, Body } from '@nestjs/common';
import { CreateCatDto } from '../classes/create-cat-dto';
import { Cat } from '../interfaces/cat';
import { CatsService } from '../services/cats.service';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) { }

    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
    }
}
