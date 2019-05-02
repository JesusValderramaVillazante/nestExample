import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import { ServiceUnavailableException } from '@nestjs/common';

export interface EnvConfig {
    [key: string]: string;
}

export class ConfigService {
    private readonly envConfig: EnvConfig;

    constructor(filePath: string) {
        //{ DATABASE_USER: 'test;', DATABASE_PASSWORD: 'test;' }
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get(key: string): string {
        //this.envConfig['DATABASE_USER'];
        return this.envConfig[key];
    }
}