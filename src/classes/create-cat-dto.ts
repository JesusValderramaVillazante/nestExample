import { IsString, IsInt, Length } from 'class-validator';
export class CreateCatDto {
    @Length(0,4)
    name: string;
    @IsInt()
    age: number;
    @IsString()
    breed: string;
}
