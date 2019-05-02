import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { LoggerMiddleware } from './logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { DogModule } from './dog/dog.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from './config-module/config-module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'ejm',
      entities: [__dirname + '/**/cats/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CatsModule,/*MongooseModule.forRoot('mongodb://localhost/nest'), DogModule,*/
    EventsModule,
    ConfigModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}


