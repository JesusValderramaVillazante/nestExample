import { Injectable } from '@nestjs/common';
import { CatsService } from './cats.service';
import { JwtPayload } from './jwt-payload';
import * as jwt from 'jsonwebtoken';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly catsService: CatsService, private readonly userService: UserService
    ) { }

    async validateUser(payload: JwtPayload): Promise<any> {
        return await this.userService.findOneByEmail(payload.email);
    }

    async createToken() {
        const user: JwtPayload = { email: 'jesus@gmail.com' };
        const expiresIn = 3600;
        const accessToken = jwt.sign(user, 'secretKey', { expiresIn });
        return {
            expiresIn,
            accessToken,
        };
    }
}
