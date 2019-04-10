import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CatInterface } from './cat.interface';

@Entity()
export class Cat implements CatInterface{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 500 })
    name: string;

    @Column()
    age: number;

    @Column()
    breed: string;
}