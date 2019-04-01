#Módulos

Un módulo es una clase anotada con un decorador `@Module()`. El decorador `@Module()` proporciona metadatos que Nest utiliza para organizar la estructura de la aplicación.

Cada aplicación tiene al menos un módulo, un módulo raíz. El módulo raíz es el lugar donde Nest está comenzando a organizar el gráfico de la aplicación. De hecho, el módulo raíz podría ser el único módulo en su aplicación, especialmente cuando la aplicación es pequeña. Sin embargo, para aplicaciones grandes, no tiene sentido. En la mayoría de los casos, tendrá varios módulos, cada uno con un conjunto de capacidades estrechamente relacionadas.

El decorador `@Module()` toma un solo objeto cuyas propiedades describen el módulo:

1.  **providers:** los proveedores que crearán una instancia del inyector Nest y se podrán compartir al menos a través de este módulo.
2.  **controllers:** El conjunto de controladores que hay que crear.
3.  **imports:** La lista de módulos importados que exportan a los proveedores que se requieren en este módulo.
4.  **exports:** El subconjunto de proveedores que proporciona este módulo y debería estar disponible en los otros módulos.

El módulo encapsula proveedores por defecto. Esto significa que es imposible inyectar proveedores que no forman parte directamente del módulo actual ni se exportan desde los módulos importados.

## Feature modules#

El CatsController y el CatsService pertenecen al mismo dominio de aplicaciones. Consideraremos llevarlos a un módulo de características, siendo el CatsModule.

```JS
// cats/cats.module.ts.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

export class CatsModule {}
```

Definimos el archivo cats.module.ts y después de eso movimos todo lo relacionado con este módulo al directorio de gatos. Lo último que debemos hacer es importar este módulo en el módulo raíz (ApplicationModule).

```JS
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule {}
```

Así es como se ve nuestra estructura de directorios ahora:

## Módulo compartido

En Nest, los módulos son singletons por defecto, y así puede compartir la misma instancia de cualquier proveedor entre 2 .. * módulos sin esfuerzo.

Cada módulo es un módulo compartido de hecho. Una vez creado, puede ser reutilizado por cualquier módulo. Imaginemos que queremos compartir la instancia de CatsService entre algunos otros módulos. Para hacer eso, necesitamos poner el servicio Cats en la matriz de exportaciones como se muestra a continuación:

```JS
// cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

Ahora, cada módulo que importaría CatsModule tiene acceso a CatsService y compartirá la misma instancia con todos los módulos que importan este módulo también.

## Módulos reexportando

Los módulos pueden exportar sus proveedores internos. Además, pueden reexportar módulos importados por ellos mismos.

```JS
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}

Dependency injection#
```

## Inyección de dependencia

Una clase de módulo también puede inyectar proveedores (por ejemplo, para fines de configuración):

```JS
// cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private readonly catsService: CatsService) {}
}
```

Sin embargo, los proveedores no pueden inyectar clases de módulos debido a la dependencia circular.

## Módulos globales

Si tiene que importar el mismo conjunto de módulos en todas partes, puede ser molesto. En Angular, los proveedores están registrados en el ámbito global. Una vez definidos, están disponibles en todas partes. Por otro lado, Nest encapsula proveedores dentro del alcance del módulo. No puede utilizar los proveedores de módulos en otro lugar sin importarlos. Pero a veces, es posible que solo desee proporcionar un conjunto de cosas que deberían estar disponibles siempre, listas para usar, por ejemplo: ayudantes, conexión de base de datos, lo que sea. Es por eso que puedes hacer que el módulo sea global.

```JS
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

El decorador `@Global()` hace que el módulo sea de alcance global. Los módulos globales se registrarán solo una vez, en el mejor de los casos mediante el módulo raíz o el módulo principal. Después, el proveedor de CatsService estará en todas partes, aunque CatsModule no se importará.

## Módulos dinámicos

El sistema de módulos Nest viene con una característica llamada módulos dinámicos. Te permite crear módulos personalizables sin ningún esfuerzo. Echemos un vistazo al DatabaseModule:

```JS
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

Este módulo define el proveedor de conexión de forma predeterminada, pero adicionalmente, dependiendo de las opciones y entidades aprobadas, expone una colección de proveedores, por ejemplo, repositorios. De hecho, el módulo dinámico extiende (¡no reemplaza!) Los metadatos del módulo base. Esta característica sustancial es útil cuando necesita registrar proveedores dinámicamente. Luego puedes importar el DatabaseModule de la siguiente manera:

```JS
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class ApplicationModule {}
```

Para exportar un módulo dinámico, puede omitir una parte de llamada de función:

```JS
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class ApplicationModule {}
```