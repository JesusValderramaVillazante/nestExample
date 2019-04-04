import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCatDto } from '../classes/create-cat-dto';
import { Cat } from '../interfaces/cat';
import { CatsService } from './cats.service';
import { ForbiddenException } from 'src/forbidden.exception';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) { }

    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
    
        try{
            return await this.catsService.findAll();
        }catch(e){
            throw new ForbiddenException();
        }
    }
}
