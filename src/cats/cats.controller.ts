import { Controller, Get, Post, Body, HttpException, HttpStatus, UsePipes, Param } from '@nestjs/common';
import { CreateCatDto } from '../classes/create-cat-dto';
import { Cat } from '../interfaces/cat';
import { CatsService } from './cats.service';
import { ForbiddenException } from 'src/forbidden.exception';
import { ParseIntPipe } from 'src/parse-int.pipe';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) { }
    
    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        try {
            return await this.catsService.findAll();
        } catch (e) {
            throw new ForbiddenException();
        }
    }

    @Get(':id')
    async findOne(@Param('id', new ParseIntPipe()) id) {
       return id;
    }
}
