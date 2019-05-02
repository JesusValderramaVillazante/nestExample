import { Schema } from 'mongoose';

export const DogSchema = new Schema({
  name: String,
  age: Number,
  breed: String,
});

/*
export class h extends Schema {
  constructor() {
    super({
      name: String,
      age: Number,
      breed: String,
    });
  }
}
*/