# **Providers**
Los proveedores son un concepto fundamental en Nest. Muchas de las clases básicas de Nest pueden tratarse como proveedores: `servicios`, `repositorios`, `fábricas`, `ayudantes`, etc. La idea principal de un proveedor es que puede inyectar dependencias; esto significa que los objetos pueden crear varias relaciones entre sí, y la función de "cablear" las instancias de objetos se puede delegar en gran medida al sistema de tiempo de ejecución Nest. Un proveedor es simplemente una clase anotada con un decorador `@Injectable()`.

En el capítulo anterior, construimos un simple CatsController. Los controladores deben manejar las solicitudes HTTP y delegar tareas más complejas a los proveedores. Los proveedores son clases simples de JavaScript con un decorador @Injectable () que precede a su declaración de clase.

>   Insinuación
Dado que Nest permite la posibilidad de diseñar y organizar dependencias de una manera más way, `recomendamos encarecidamente seguir los principios de SOLID`.

# Servicios
Vamos a empezar por crear un servicio Cats simple. Este servicio será responsable del almacenamiento y recuperación de datos, y está diseñado para ser utilizado por CatsController, por lo que es un buen candidato para ser definido como proveedor. Así, decoramos la clase con `@Injectable()`.

```JS
// cats.service.ts 
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

Nuestro servicio Cats es una clase básica con una propiedad y dos métodos. La única característica nueva es que utiliza el decorador `@Injectable()`. El decorador `@Injectable()` adjunta metadatos, lo que le dice a Nest que esta clase es un proveedor de Nest. Por cierto, este ejemplo también utiliza una interfaz Cat, que probablemente se parece a esto:

```JS
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

Ahora que tenemos una clase de servicio para recuperar gatos, usémoslo dentro de la CatsController:

```Js
// cats.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

El servicio Cats se inyecta a través del constructor de la clase. Observe el uso de la sintaxis de solo lectura privada. Esta taquigrafía nos permite declarar e inicializar el miembro catsService inmediatamente en la misma ubicación.

# Inyección de dependencia

El nido se construye alrededor del fuerte patrón de diseño comúnmente conocido como inyección de dependencia. Recomendamos leer un gran artículo sobre este concepto en la documentación oficial de Angular.

En Nest, gracias a las capacidades de TypeScript, es extremadamente fácil administrar las dependencias porque se resuelven solo por tipo. En el ejemplo a continuación, Nest resolverá el servicio cats creando y devolviendo una instancia de CatsService (o, en el caso normal de un singleton, devolviendo la instancia existente si ya se ha solicitado en otro lugar). Esta dependencia se resuelve y se pasa al constructor de su controlador (o se asigna a la propiedad indicada):

```JS
constructor(private readonly catsService: CatsService) {}
```

# Alcances

Los proveedores normalmente tienen una vida útil ('alcance') sincronizada con el ciclo de vida de la aplicación. Cuando la aplicación se reinicia, se debe resolver cada dependencia y, por lo tanto, se debe crear una instancia de cada proveedor. Del mismo modo, cuando la aplicación se apaga, cada proveedor será destruido. Sin embargo, también hay formas de hacer que el alcance de la solicitud de por vida de su proveedor también. Puedes leer más sobre estas técnicas aquí

# Proveedores personalizados

Nest tiene un contenedor de inversión de control ("IoC") incorporado que resuelve las relaciones entre los proveedores. Esta característica subyace a la característica de inyección de dependencia descrita anteriormente, pero de hecho es mucho más poderosa de lo que hemos descrito hasta ahora. El decorador @Injectable () es solo la punta del iceberg, y no es la única forma de definir proveedores. De hecho, puede utilizar valores planos, clases y fábricas asíncronas o síncronas. Más ejemplos se proporcionan aquí

# Proveedores opcionales

En ocasiones, es posible que tenga dependencias que no necesariamente deben resolverse. Por ejemplo, su clase puede depender de un objeto de configuración, pero si no se pasa ninguno, se deben usar los valores predeterminados. En tal caso, la dependencia se vuelve opcional, porque la falta del proveedor de configuración no daría lugar a errores.

Para indicar que un proveedor es opcional, use el decorador @Optional () en la firma del constructor.

```JS
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(
    @Optional() @Inject('HTTP_OPTIONS') private readonly httpClient: T
  ) {}
}
```

Tenga en cuenta que en el ejemplo anterior estamos usando un proveedor personalizado, que es la razón por la que incluimos el token personalizado HTTP_OPTIONS. Los ejemplos anteriores mostraron una inyección basada en el constructor que indica una dependencia a través de una clase en el constructor. Lea más sobre proveedores personalizados y sus tokens asociados aquí.

# Inyección basada en la propiedad

La técnica que hemos usado hasta ahora se llama inyección basada en constuctor, ya que los proveedores se inyectan a través del método del constructor. En algunos casos muy específicos, la inyección basada en propiedades podría ser útil. Por ejemplo, si su clase de nivel superior depende de uno o varios proveedores, pasarlos al máximo llamando a super () en subclases desde el constructor puede ser muy tedioso. Para evitar esto, puede utilizar el decorador @Inject () en el nivel de propiedad.

```JS
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

# Número de registro del proveedor

Ahora que hemos definido un proveedor (CatsService) y tenemos un consumidor de ese servicio (CatsController), debemos registrar el servicio con Nest para que pueda realizar la inyección. Hacemos esto editando nuestro archivo de módulo (app.module.ts) y agregando el servicio a la matriz de proveedores del decorador @Module ().

```JS
// app.module.ts 
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class ApplicationModule {}
```