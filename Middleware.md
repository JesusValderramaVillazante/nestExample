# Middleware

El middleware es una función que se llama antes que el manejador de ruta. Las funciones de middleware tienen acceso a los objetos de solicitud y respuesta, y la siguiente función de middleware en el ciclo de solicitud-respuesta de la aplicación. La siguiente función de middleware es comúnmente denotada por una variable llamada next.

El middleware Nest, por defecto, es igual al middleware expreso. Aquí hay una gran lista de las capacidades de middleware copiadas de la documentación expresa oficial:

Las funciones de middleware pueden realizar las siguientes tareas:
-   Ejecutar cualquier código.
-   Realizar cambios en la solicitud y en los objetos de respuesta.
-   terminar el ciclo de solicitud-respuesta.
-   llamar a la siguiente función de middleware en la pila.
-   Si la función de middleware actual no finaliza el ciclo de solicitud-respuesta, debe llamar a next () para pasar el control a la siguiente función de middleware. De lo contrario, la solicitud quedará colgada.

El middleware Nest es una función o una clase con un decorador `@Injectable()`. La clase debe `implementar la interfaz NestMiddleware`, mientras que la función no tiene ningún requisito especial.

```JS
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...');
    next();
  }
}
```

# Inyección de dependencia

No hay excepción cuando se trata del middleware. Al igual que los proveedores y los controladores, pueden inyectar dependencias que pertenecen al mismo módulo (a través del constructor)

# Aplicando middleware

No hay lugar para el middleware en el decorador @Module(). Tenemos que configurarlos usando el método configure() de la clase de módulo. Los módulos que incluyen middleware deben implementar la interfaz NestModule. Vamos a configurar el LoggerMiddleware en el nivel ApplicationModule.

```JS
// app.module.ts 
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

En el ejemplo anterior, hemos configurado LoggerMiddleware para los manejadores de rutas `/ cats` que hemos definido previamente en CatsController. Además, podemos restringir un middleware al método de solicitud particular.

```JS
// app.module.ts 
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

# Route wildcards
Las rutas basadas en patrones también se apoyan. Por ejemplo, el asterisco se utiliza como comodín, y coincide con cualquier combinación de caracteres.

```JS
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

La ruta de la ruta anterior coincidirá con abcd, ab_cd, abecd, y así sucesivamente. Los caracteres?, +, * Y () son subconjuntos de sus contrapartes de expresiones regulares. El guión (-) y el punto (.) Se interpretan literalmente mediante rutas basadas en cadenas.

# Consumidor de middleware

El MiddlewareConsumer es una clase de ayuda. Proporciona varios métodos incorporados para administrar middleware. Todos ellos pueden ser simplemente encadenados. ForRoutes () puede tomar una sola cadena, varias cadenas, objeto RouteInfo, una clase de controlador e incluso varias clases de controlador. En la mayoría de los casos, probablemente solo pasará los controladores y los separará con una coma. A continuación se muestra un ejemplo con un solo controlador:

```JS
// app.module.ts 
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

>   **Hint**
El método de aplicación () puede tomar un solo middleware o varios argumentos para especificar múltiples middlewares.


Mientras se usa la clase, es posible que con frecuencia querremos excluir ciertas rutas. Eso es muy intuitivo debido al método exclude ().

```JS
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
  )
  .forRoutes(CatsController);
```

En consecuencia, LoggerMiddleware estará limitado a todas las rutas definidas dentro de CatsController, excepto que estas dos pasarán a la función exclude (). Tenga en cuenta que el método exclude () no funcionará con su middleware funcional. Además, esta función no excluye las rutas de las rutas más genéricas (por ejemplo, comodines). En tal caso, debería poner su lógica de restricción de rutas de acceso directamente al middleware y, por ejemplo, comparar la URL de una solicitud.

# Middleware funcional

El LoggerMiddleware es bastante corto. No tiene miembros, ni métodos adicionales, ni dependencias. ¿Por qué no podemos usar una función simple? Es una buena pregunta, de hecho, podemos. Este tipo de middleware se llama middleware funcional. Transformemos el registrador en una función.

```JS
//  logger.middleware.ts
JS 
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

Y usarlo en el ApplicationModule:

```JS
// app.module.ts
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

>   **Insinuación**
Consideremos el uso de middleware funcional cada vez que su middleware no necesite dependencias.

# Múltiple middleware

Como se mencionó anteriormente, para vincular múltiples middleware que se ejecutan secuencialmente, podemos separarlos por una coma dentro del método apply ().

```JS
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

# Middleware global

Para vincular un middleware a cada ruta registrada a la vez, podemos aprovechar el método de uso() que proporciona la instancia de INestApplication:

```JS
const app = await NestFactory.create(ApplicationModule);
app.use(logger);
await app.listen(3000);
```