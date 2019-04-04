# **Controller**

# Enrutamiento
En el siguiente ejemplo usaremos el decorador `@Controller()`, que se requiere para definir un controlador básico. Especificaremos un prefijo de ruta, de ruta opcional de los gatos. El uso de un prefijo de ruta en un decorador `@Controller()` nos permite agrupar fácilmente un conjunto de rutas relacionadas y minimizar el código repetitivo. Por ejemplo, podemos elegir agrupar un conjunto de rutas que gestionan las interacciones con una entidad del cliente en la ruta /clientes. En ese caso, podríamos especificar el prefijo de ruta a los clientes en el decorador `@Controller()` para que no tengamos que repetir esa parte de la ruta para cada ruta en el archivo.

```JS
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```
> **Insinuación**
Para crear un controlador utilizando la CLI, simplemente ejecute el comando `$ nest g controller cats`.

El decorador del método de solicitud HTTP `@Get()` antes del método `findAll()` le dice a Nest que cree un controlador para un punto final específico para las solicitudes HTTP. El punto final corresponde al método de solicitud HTTP (GET en este caso) y la ruta de la ruta. ¿Cuál es la ruta de la ruta? La ruta de la ruta para un controlador se determina mediante la concatenación del prefijo `(opcional)` declarado para el controlador y cualquier ruta especificada en el decorador de solicitudes. Desde que hemos declarado un prefijo para cada ruta (gatos), y no hemos agregado ninguna información de ruta en el decorador, Nest asignará las solicitudes `GET /cats` a este controlador. Como se mencionó, la ruta incluye tanto el prefijo de ruta del controlador opcional como cualquier cadena de ruta declarada en el decorador del método de solicitud. Por ejemplo, un prefijo de ruta de los clientes combinado con el decorador `@Get('perfil')` produciría una asignación de ruta para solicitudes como `GET /clientes/perfil`.

En nuestro ejemplo anterior, cuando se realiza una solicitud GET a este punto final, Nest enruta la solicitud a nuestro método `findAll()` definido por el usuario. Tenga en cuenta que el nombre del método que elegimos aquí es completamente arbitrario. Obviamente, debemos declarar un método para vincular la ruta, pero Nest no agrega ningún significado al nombre del método elegido. Este método devolverá un código de estado 200 y la respuesta asociada, que en este caso es solo una cadena. ¿Por qué sucede eso? Para explicarlo, primero presentaremos el concepto de que Nest emplea dos opciones diferentes para manipular las respuestas:

# Standard (recommended)
Usando este método incorporado, cuando un controlador de solicitudes devuelve un objeto o una matriz de JavaScript, `se serializará automáticamente a JSON`. Sin embargo, cuando devuelve una cadena, Nest enviará solo una cadena sin intentar serializarla. Esto hace que el manejo de la respuesta sea simple: simplemente devuelva el valor y Nest se encargará del resto.

Además, el código de estado de la respuesta es siempre 200 de forma predeterminada, excepto para las solicitudes `POST que usan 201`. Podemos cambiar este comportamiento fácilmente agregando el decorador `@HttpCode(...)` a nivel de manejador (consulte Códigos de estado).

# Library-specific
Podemos usar el objeto de respuesta específico de la biblioteca (por ejemplo, Express), que se puede inyectar con el decorador `@Res()` en la firma del controlador de método `(por ejemplo, findAll(@Res() request: Request))`. Con este enfoque, tiene la capacidad (y la responsabilidad)de usar los métodos de manejo de respuesta nativos expuestos por ese objeto. Por ejemplo, con Express, puede construir respuestas usando código como `response.status(200).send()`

> **Advertencia**   
No puedes usar ambos enfoques al mismo tiempo. Nest detecta cuando el controlador está utilizando `@Res()` o `@Next()`, lo que indica que ha elegido la opción específica de la biblioteca. Si ambos enfoques se utilizan al mismo tiempo, el enfoque estándar se desactiva automáticamente para esta ruta única y ya no funcionará como se esperaba.

# Request object
Los manejadores a menudo necesitan acceso a los detalles de solicitud del cliente. Nest proporciona acceso al objeto de solicitud de la plataforma subyacente (Express de forma predeterminada). Podemos acceder al objeto de solicitud indicando a Nest que lo inyecte agregando el decorador @Req () a la firma del controlador.

```JS
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```
> **Hint**
Para aprovechar las tipificaciones Express (como en la solicitud: ejemplo de parámetro de solicitud anterior), `install @types/express` package.

El objeto de solicitud representa la solicitud HTTP y tiene propiedades para la cadena de consulta de solicitud, los parámetros, los encabezados HTTP y el cuerpo (lea más aquí). En la mayoría de los casos, no es necesario capturar estas propiedades manualmente. Podemos utilizar decoradores dedicados en su lugar, como `@Body()` o `@Query()`, que están disponibles de forma inmediata. A continuación se muestra una lista de los decoradores proporcionados y los objetos específicos de la plataforma que representan.

1.  @Request()
  - req
2.  @Response()
  - res
3.  @Next()
  - next
4.  @Session()
  - req.session
5.  @Param(key?: string)
  - req.params / req.params[key]
6.  @Body(key?: string)
  - req.body / req.body[key]
7.  @Query(key?: string)
  - req.query / req.query[key]
8.  @Headers(name?: string)
  - req.headers / req.headers[name]


# Resources

Antes, definimos un punto final para buscar el recurso de gatos (ruta). Normalmente también queremos proporcionar un punto final que crea nuevos registros. Para esto, vamos a crear el controlador de POST:

```JS
// cats.controller.ts
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```


Es así de simple. Nest proporciona el resto de los decoradores de punto final de solicitud HTTP estándar de la misma manera: `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, `@Head()` y `@All()`. Cada uno representa su método de solicitud HTTP respectivo.

# Status code
Como se mencionó, el código de la respuesta a la respuesta es siempre 200 por defecto, excepto por el POST solicitudes que son 201. podemos cambiar fácilmente este comportamiento añadiendo el decorador de `@HttpCode(...)` a nivel de un `controlador`.

```JS
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

A menudo, su código de estado no es estático sino que depende de varios factores. En ese caso, puede usar un objeto de respuesta específica de la biblioteca `(inyectar utilizando @Res())` `(o, en caso de error, lanzar una excepción)`.

##Encabezados
---
Para especificar un encabezado de respuesta personalizado, puede usar un decorador `@Header()` o un objeto de respuesta específico de la biblioteca (y llamar a `res.header()` directamente).

```Js
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

# Parámetros de ruta
Las rutas con rutas estáticas no funcionarán cuando necesite aceptar datos dinámicos como parte de la solicitud (por ejemplo, GET / cats / 1) para obtener cat con id 1). Para definir rutas con parámetros, podemos agregar tokens de parámetros de ruta en la ruta de la ruta para capturar el valor dinámico en esa posición en la URL de la solicitud. El token de parámetro de ruta en el ejemplo del decorador `@Get()` a continuación demuestra este uso. Se puede acceder a los parámetros de ruta declarados de esta manera utilizando el decorador `@Param()`, que debe agregarse a la firma del método.

```JS
@Get(':id')
findOne(@Param() params): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` se utiliza para decorar un parámetro de método (parámetros en el ejemplo anterior), y hace que los parámetros de ruta estén disponibles como propiedades de ese parámetro de método decorado dentro del cuerpo del método. Como se ve en el código anterior, podemos acceder al parámetro id haciendo referencia a `params.id` También puede pasar un token de parámetro particular al decorador y luego hacer referencia al parámetro de ruta directamente por nombre en el cuerpo del método.

```JS
@Get(':id')
findOne(@Param('id') id): string {
  return `This action returns a #${id} cat`;
}
```

# Rutas orden
Tenga en cuenta que el orden de registro de la ruta (el orden en que aparece el método de cada ruta en una clase) es importante. Supongamos que tiene una ruta que devuelve gatos por identificador `(cats/:id)`. Si registra otro punto final debajo de él en la definición de clase que devuelve todos los gatos a la vez (gatos), una solicitud GET /cats nunca llegará al segundo controlador como se desee, ya que todos los parámetros de ruta son opcionales. Vea el siguiente ejemplo:

```JS
@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Get()
  findAll() {
    // Este punto final nunca será llamado
    // Porque la solicitud de "/gats va a ir
    // Ser capturado por el "/cats/: id de la ruta
  }
}
```

Para evitar tales efectos secundarios, simplemente mueva la declaración `findAll()` (incluido su decorador) sobre `findOne()`

# Alcances

Para las personas que provienen de diferentes orígenes del lenguaje de programación, puede ser inesperado saber que en Nest, casi todo se comparte en las solicitudes entrantes. Tenemos un grupo de conexión a la base de datos, servicios singleton con estado global, etc. Recuerde que Node.js no sigue el modelo sin estado de múltiples hilos con solicitud/respuesta en el que cada solicitud es procesada por un hilo diferente. Por lo tanto, el uso de instancias de singleton es completamente seguro para nuestras aplicaciones.

Sin embargo, hay casos extremos en los que la vida útil del controlador basada en la solicitud puede ser el comportamiento deseado, por ejemplo, el almacenamiento en caché por solicitud en las aplicaciones GraphQL, el seguimiento de solicitudes o la tenencia múltiple. Aprende a controlar los ámbitos aquí.

# Asynchronicity

Amamos lo mmoderno JavaScript y sabemos que la extracción de datos es casi asíncrono. Por eso Nest apoya y trabaja bien con funciones async.

Cada función async tiene que devolver una promesa. Esto significa que puede devolver un valor aplazado que el Nest podrá resolver por sí solo. Veamos un ejemplo de esto:

```JS
//cats.controller.ts 
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

El código anterior es totalmente válido. Además, los manejadores de rutas Nest son aún más poderosos al poder devolver flujos `observables RxJS`. Nest se suscribirá automáticamente a la fuente de abajo y tomará el último valor emitido (una vez que se complete la secuencia).

```JS
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```
Ambos enfoques anteriores funcionan y puede usar lo que se ajuste a sus necesidades.

# Solicitar carga útil

Nuestro ejemplo anterior del controlador de ruta POST no aceptó ningún parámetro de cliente. Arreglamos esto agregando el decorador `@Body()` aquí.

Pero primero (si usa TypeScript), debemos determinar el esquema DTO (objeto de transferencia de datos). Un DTO es un objeto que define cómo se enviarán los datos a través de la red. Podríamos determinar el esquema DTO utilizando interfaces TypeScript o clases simples. Curiosamente, recomendamos usar clases aquí. ¿Por qué? Las clases forman parte del estándar JavaScript ES6 y, por lo tanto, se conservan como entidades reales en el JavaScript compilado. Por otro lado, dado que las interfaces de TypeScript se eliminan durante la transpilación, Nest no puede referirse a ellas en tiempo de ejecución. Esto es importante porque las características como Pipes habilitan posibilidades adicionales cuando tienen acceso al metatipo de la variable en tiempo de ejecución

```JS
//Let's create the CreateCatDto class:

export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

It has only three basic properties. Thereafter we can use the newly created DTO inside the `CatsController`:
```JS
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

# Full resource sample

A continuación se muestra un ejemplo que hace uso de varios de los decoradores disponibles para crear un controlador básico. Este controlador expone un par de métodos para acceder y manipular datos internos.
```JS
//cats.controller.ts
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

#Getting up and running

Con el controlador anterior completamente definido, Nest aún no sabe que CatsController existe y, como resultado, no creará una instancia de esta clase.

Los controladores siempre pertenecen a un módulo, por lo que incluimos la matriz de controladores dentro del decorador `@Module()`. Como aún no hemos definido ningún otro módulo, excepto el módulo de aplicación raíz, usaremos eso para introducir el controlador Cats:

```Js
//app.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class ApplicationModule {}
```

Adjuntamos los metadatos a la clase de módulo utilizando el decorador `@Module()`, y ahora Nest puede reflejar fácilmente qué controladores deben montarse.

# Apéndice: enfoque de biblioteca específica

Hasta ahora hemos discutido la forma estándar de Nest de manipular respuestas. La segunda forma de manipular la respuesta es usar un objeto de respuesta específico de la biblioteca. Para inyectar un objeto de respuesta particular, necesitamos usar el decorador `@Res()`. Para mostrar las diferencias, reescribamos CatsController a lo siguiente:

```JS
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

Aunque este enfoque funciona y, de hecho, permite más flexibilidad de alguna manera al proporcionar un control total del objeto de respuesta (manipulación de encabezados, características específicas de la biblioteca, etc.), debe utilizarse con cuidado. En general, el enfoque es mucho menos claro y tiene algunas desventajas. Las principales desventajas son que pierde la compatibilidad con las características de Nest que dependen de la gestión de respuesta estándar de Nest, como los interceptores y el decorador @HttpCode (). Además, su código puede volverse dependiente de la plataforma (ya que las bibliotecas subyacentes pueden tener diferentes API en el objeto de respuesta) y ser más difíciles de probar (tendrá que burlarse del objeto de respuesta, etc.).

Como resultado, siempre se debe preferir el enfoque estándar de Nest cuando sea posible.