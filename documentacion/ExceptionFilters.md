# **Exception filters**
la capa de expepciones incorparada es responsable de manejar todas las excepciones lanzadas en toda la aplicacion. Cuando se detecta una excepcion no controlada, el usuario final recibira una respuesta adecuada y facil de usar

cada excepcion ocurrida es manejada por el filtro de excepcion global, y cuando no se reconoce (no es HttpException ni una clase que hereda de HttpException), un usuario recibe la siguiente respuesta JSON.

```JS
{
    "statusCode":500,
    "messahe": "interna server error"
}
```

# Base Exceptions
hay una clase HttpException incorporada expuesta desde el paquete `@nestjs/common` como ya save cuando lanza un objeto HttpException el controlador lo detecta y posteriormente lo transforma en la respues JSON correspondiente.

en `CatsController` tenemos un metodo `findAll()` (una ruta GET). supongamos que este controlador de ruta lanzaria una excepcion por algun motivo, lo vamos a codificar:

```JS
//cats.controller.ts
@Get()
async findAll(){
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```
cuando el cliente llama a este endpoint, la respuesta se veria asi

```JS
{
    "satusCode": 403,
    "message": "Forbidden"
}
```
el constructor `HttpException` toma cadena, Objeto como primer argumento. si pasa un objeto en lugar de una cadena, anulara completamente el cuerpo de la respuesta

```JS
//cats.controller
@Get()
async findAll(){
    throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'this is a custom mesage',
    }, 403);
}
```
y asi es como se veria la respuesta:

```JS
{
    "statusCode": 403,
    "error": "this is a custom message"
}
```
# Jerarquia de excepciones

una buena practica es crear su propia jerarquia de excpciones. esto significa que cada excepcion HTTP debe heredad de la clase HttpException base. como resultado, Nest reconocera su excepcion y se ocupara completamente de la respuesta de error.

```JS
//forbidden.exception.ts
export class ForbiddenException extends HttpException{
    constructor(){
        super('Forbidden', HttpStatus.FORBIDDEN);
    }
}
```
dado que ForbiddenException extienda de HttpException base, funcionara bien con el controlador de excepciones del nucleo y , por lo tanto, podemos usarlo dentro del metodo `findAll()`.

```JS
//cats.controller.ts
@Get()
async findAll(){
    throw new ForbiddenException();
}
```
# HTTP exceptions

para reducir el codigo de boilerplate, Nest proporciona un conjunto de excepciones utilizables que se heradan de la HttpException central. todos ellos estan expuesto desde el paquete `@nestjs/common`:

-   BadRequestException
-   UnauthorizedException
-   NotFoundException
-   ForbiddenException
-   NotAcceptableException
-   RequestTimeoutException
-   ConflictException
-   GoneException
-   PayloadTooLargeException
-   UnsupportedMediaTypeException
-   UnprocessableEntityException
-   InternalServerErrorException
-   NotImplementedException
-   BadGatewayException
-   ServiceUnavailableException
-   GatewayTimeoutException

# Exception filters
el controlador de excepciones base esta bien, pero a veces es posible que desee tener control total sobra la capa de excepciones, por ejemplo, agregar algun registro o usar un esquema JSON diferente basado en algunos factores elegidos.
adoramos las soluciones genericas y simplificamos su vida es por eso que se ha creado la caracteristica llamado filtros de excepcion.
vamos a crear filtro que es responsable de detectar las excepciones que son una instancia de la HttpException y configurar una logica de respuesta personalizada para ellas.

```JS
//http-exception.filter.ts
inport{ExceptionFilter, Cath, ArgumentsHost, HttpException} form '@nestjs/common';
import{Request, Response} from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
    catch(exception: HttpException, host: ArgumentHost){
        const ctx = hots.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response
            .status(status)
            .json(
                status.Code: status, 
                timestamp: new Date().toISOString(), 
                path: request.url
            )};
}
```
el decorador `@Catch(HttpException)` enlaza los metadatos requeridos al filtro de excepcion, y le dice a Nest que este filtro en particular esta buscando la HttpException y nada mas. en la practica, el decorador `@Catch()` puede tomar una cantidad infinita de parametros y por lo tanto puede configurar el filtro para varios tipos de escepciones al separarlos con una coma

# Argumentos host

la propiedad de excepcion es una excepcion procesada actualmente, mientras que el host es un objeto ArgumentHost.
ArgumentsHost es un envoltorio alrededor de los argumentos que se han pasado al controlador original y contiene una matriz de arguentos diferente bajo el capo segun el tipo de la aplicacion (y la plataforma que se esta utilizando).

```JS
export interface ArgumentsHost{
    getArgs<T extends Array<any> = any[]>(); T;
    getArgByIndex<T = any>(index: number): T;
    switchToRpc(): RpcArgumentsHost;
    switchToHtto(): HttpArgumentsHost;
    switchToWs(): WsArgumentsHost;
}
```

ARgumentsHost nos proporciona un conjunto de metodos utiles que ayudan a elegir los argumentos correctos de la matriz subyacente.
en otras palabras, ArgumentsHost no es nada mas que un conjunto de argumentos. por ejemplo cuando el filtro se usa dentro del contexto de la aplicacion HTTP, ArgumentsHost contendra la matriz [Requet, Response] es su interior. sin embargo cuando el contexto actual es una aplicacion de sockets web esta matriz sera igual a [cliente, datos]. esta decision de diseño le permite acceder a cualquier argumento que eventualmente se pasaria al controlador correspondiente

```JS
//cats.controller.ts
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto){
    throw new ForbiddenException();
}
```

>   El decorador `@UseFilters()` se importa del paquete `@nestjs/common`

hemos utilizado el decorador `@UseFilters()` aqui igual que `@Catch()` toma una cantidad infinita de parametros. la instancia de HttpExceptionFilter se ha creado inmediatamente en el lugar, otra forma disponible es pasar la clase (no la instancia) dejando al marco la reponsabilidad de instanciacion y habilitando la inyeccion de dependencia.

```JS
//cats.controller.ts
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto){
    throw new ForbiddenException();
}
```
>   prefiere aplicar la clase en lugar de instancia cuando sea posible. reduce el uso de memoria ya que nest puede reutilizar facilmente instancias de la misma clase en todo su modulo

En el ejemplo anterior, el HttpExceptionFilter se aplica solo al controlador de ruta de create() ruta unica  pero no es la unica forma disponible de hecho los filtros de excepcion pueden ser de alcance de metodo, de controlador y tambien de `ambito global`

```JS
//cats.controller.ts
@UseFilters(new HttpExceptionFilter())
exports class CatsController{}
```

esta construccion figura el HttpExceptionFilter para nada controlador de ruta definido dentro de CatsController. es el ejemplo del filtro de excepcion de ambito de controlador el ultimo ambito disponible es el filtro de excepcion de ambito global

```JS
async function bootstrap(){
    const app = await NestFactory.create(applicationModule);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(3000);
}
bootstrap();
```

> el metodo useGlobalFilters() no configura filtros para puertas de enlace ni aplicacones hibridas.

los filtros globales se utilizan en toda la aplicacion para cada controlador y cada controlador de ruta en terminos de inyeccion de dependecia los filtros globales registrados desde el exterior de cualquier modulo (como en el ejemplo anterior) no pueden inyectar dependencias ya que no pertenecen a ningun modulo para resolver este problema puede configurar un filtro directamente desde cualquir modulo utilizando la siguiente construccion

```JS
//app.module.ts
import {} from '@nestjs/common';
import { APP_FILTER} from '@nestjs/core';

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter
        },
    ],
})

export class ApplicationModule {}
```

>   la opcion alternativa es utilizar una funcion de contexto de aplicacion, ademas useClass no es la unica forma de tratar con el registro de proveedores personalizados 

# Catch everything

para majenar cada exception ocurrida (independientemente del tipo de excepcion) puede dejar los parentesis vacios por ejemplo
`@Captura()`

```JS

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

En el ejemplo anterior, el filtro detectará cada excepción que se haya lanzado sin limitarse a un conjunto de clases particulares.

# Herencia

Normalmente, creará filtros de excepción totalmente personalizados, diseñados para cumplir con los requisitos de su aplicación. Sin embargo, puede haber casos de uso cuando desee reutilizar un filtro de excepción central ya implementado y anular el comportamiento en función de ciertos factores.

Para delegar el procesamiento de excepciones en el filtro base, debe extender BaseExceptionFilter y llamar al método catch () heredado.

```JS
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```
>   Los filtros que extienden las clases base deben ser instanciados por el propio marco (no cree instancias manualmente usando una nueva palabra clave).

Puede usar un filtro global que extienda el filtro base inyectando la referencia HttpServer.

```JS
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
```

Obviamente, debe mejorar la implementación anterior con su lógica de negocios personalizada (por ejemplo, agregar varias condiciones).