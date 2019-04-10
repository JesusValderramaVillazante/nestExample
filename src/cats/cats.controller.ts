import { Controller, Get, Post, Body, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { CatsService } from './cats.service';
import { ParseIntPipe } from 'src/parse-int.pipe';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { Cat } from 'src/cats/cat.entity';

@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {
    constructor(private readonly catsService: CatsService, private readonly authService: AuthService) { }
    
    @Get('token')
    async createToken(): Promise<any> {
      return await this.authService.createToken();
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    //@SetMetadata('roles', ['admin'])
    async findAll(): Promise<Cat[]> {
        return await this.catsService.findAll();
    }

    @Post()
    async create(@Body() createCatDto: Cat) {
        this.catsService.create(createCatDto);
    }

    @Get(':id')
    async findOne(@Param('id', new ParseIntPipe()) id) {
       return id;
    }
}
