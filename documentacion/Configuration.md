# **Configuration**
Las aplicaciones solían ejecutarse en diferentes **entornos**. Dependiendo de un entorno, se deben usar varios conjuntos de variables de configuración. Por ejemplo, es muy probable que el entorno local se base en credenciales de base de datos específicas, válidas únicamente para la instancia de db local. Para resolver este problema, solíamos aprovechar los archivos `.env`, que contienen pares clave-valor, donde cada clave representa un valor particular ya que este enfoque es muy conveniente.

Pero cuando usamos un objeto global de `process`, es difícil mantener nuestras pruebas limpias ya que la clase probada puede usarlo directamente. Otra forma es crear una capa de abstracción, un `ConfigModule` que expone un `ConfigService` con variables de configuración cargadas.

## Installation

Ciertas plataformas adjuntan automáticamente nuestras variables de entorno a process.env global. Sin embargo, en el entorno local, tenemos que cuidarlo manualmente. Para analizar nuestros archivos de entorno, usaremos un paquete dotenv.

```Bash
npm i --save dotenv
npm i --save-dev @types/dotenv
```

## Service
En primer lugar, vamos a crear una clase `ConfigService`.

```JS
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath))
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

Esta clase toma un solo argumento, un `filePath`, que es una ruta a su archivo `.env`. El método `get()` se proporciona para permitir el acceso a un objeto privado `envConfig` que contiene cada propiedad definida dentro de un archivo de entorno.

El último paso es crear un `ConfigModule`.

```JS
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
```
El `ConfigModule` registra un `ConfigService` y lo exporta también. Además, pasamos una ruta al archivo `.env` .Esta ruta será diferente dependiendo del entorno de ejecución real. Ahora puede simplemente inyectar ConfigService en cualquier lugar y extraer un valor particular basado en una clave pasada. El archivo .env de muestra podría verse a continuación:

```JS
DATABASE_USER = test;
DATABASE_PASSWORD = test;
```

## Utilizando el ConfigService

Para acceder a las variables de entorno de nuestro ConfigService necesitamos inyectarlo. Por lo tanto, primero tenemos que importar el módulo.

```JS
//app.module.ts 
@Module({
  imports: [ConfigModule],
  ...
})
```

Después, puedes inyectarlo usando un token de inyección. De forma predeterminada, el token es igual al nombre de la clase (en nuestro ejemplo `ConfigService`).

```JS
//app.service.ts 
@Injectable()
export class AppService {
  private isAuthEnabled: boolean;
  constructor(config: ConfigService) {
    // Please take note that this check is case sensitive!
    this.isAuthEnabled = config.get('IS_AUTH_ENABLED') === 'true' ? true : false;
  }
}
```
>   Insinuación
En lugar de importar ConfigModule en todos sus módulos, también puede declarar ConfigModule como un módulo global.


## Configuracion avanzada

Acabamos de implementar un ConfigService básico. Sin embargo, este enfoque tiene un par de desventajas, que abordaremos ahora:

-   faltan nombres y tipos para las variables de entorno (sin IntelliSense)
-   Falta de validación del archivo .env provisto.
-   El archivo env proporciona los valores booleanos como cadena ('verdadero') y, por lo tanto, tiene que convertirlos en un valor booleano cada vez.

## Validacion

Comenzaremos con la validación de las variables de entorno proporcionadas. Puede lanzar un error si no se han proporcionado las variables de entorno requeridas o si no cumplen con sus requisitos predefinidos. Para ello, vamos a utilizar el paquete npm Joi. Con Joi, usted define un esquema de objeto y valida los objetos de JavaScript en su contra.

Instala Joi y sus tipos (para usuarios de TypeScript):

```Bash
npm install --save joi
npm install --save-dev @types/joi
```
Una vez que los paquetes están instalados, podemos movernos a nuestro `ConfigService`.

```JS
// config.service.ts 
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),
      PORT: Joi.number().default(3000),
      API_AUTH_ENABLED: Joi.boolean().required(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
```

Dado que establecemos valores predeterminados para NODE_ENV y PORT, la validación no fallará si no proporcionamos estas variables en el archivo de entorno. Sin embargo, debemos proporcionar explícitamente API_AUTH_ENABLED. La validación también generará un error si tenemos variables en nuestro archivo .env que no forman parte del esquema. Además, Joi intenta convertir las cadenas env en el tipo correcto.

## Class properties

Para cada propiedad de configuración, tenemos que agregar una función getter.

```JS
// config.service.ts
get isApiAuthEnabled(): boolean {
  return Boolean(this.envConfig.API_AUTH_ENABLED);
}
```

# Usage example

Ahora podemos acceder directamente a las propiedades de la clase.

```JS
// app.service.ts 
@Injectable()
export class AppService {
  constructor(config: ConfigService) {
    if (config.isApiAuthEnabled) {
      // Authorization is enabled
    }
  }
}
```