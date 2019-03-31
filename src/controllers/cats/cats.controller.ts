import { Controller, Get, Delete, Put, Req, Post, Param, Query, Request, Body } from '@nestjs/common';
import { CreateCatDto } from '../../classes/create-cat-dto';
@Controller('cats')
export class CatsController {

    @Get(':id')
    async findOne(@Param('id') id): Promise<String> {
        return `This action returns a #${id} cat`;
    }

    @Get()
    findAll(): String {
        return "findAll";
    }

    @Post()
    create(@Body() createCatDto: CreateCatDto): String {
        return "Post"
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCatDto: CreateCatDto) {
        return `This action updates a #${id} cat`;
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return `This action removes a #${id} cat`;
    }
}
