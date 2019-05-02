# **Pipes**

Un pipe es una clase anotada con el decorador `@Injectable()`. la tuberia debe implementar la interfaz `PipeTransform`

una tuberia transforma los datos de entrada a la salida deseada ademas podria hacerse cargo de la validacion ya que es posible lanzar una excepcion cuando los datos son incorrectos

>   la tuberia corre dentro de la zona de excepciones esto significa que cuando se lanzan excepciones son manejadas por el controlador de excepciones del ucleo y los filtros de excepciones que se aplican al contexto actual.

# Built-in pipes
nest viene con dos tuberias disponibles listas para usar `ValidationPipe` y `ParseIntPipe` se exportan desde el paquete `@nestjs/common` para entender mejor como funcionan los vamos a construir desde cero.

# Como se ve?
vamosa empezar con el `ValidationPipe` inicialmente, solo toma un valor e inmediatamente devuelve el mismo valor comportandose como una funcion de identidad

```JS
//validation.pipe.ts
import {PipeTransform, Injectable, ArgumentMetadata} from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform{
    transform(value: any, metada: ArgumentMetadata){
        return value;
    }
}
```
>   `PipeTransform<T, R>` es una interfaz generica en la que T indica un tipo de valor de entrada, mientras que R es  el tipo de retorno del metodo transform().

cada tuberia tiene que proporcionar el metodo `transform()` este metodo toma dos argumentos:
-   value
-   metadata

el valor es el parametro procesado actualmente mientras que los metadatos son sus metadatos el objeto de metadatos tiene alguna propiedades.

```JS
export interface ArgumentMetadata{
    readonly type: 'body' | 'query' | 'param' | 'custom';
    readonly metatype?: Type<any>;
    readonly data?: string;
}
```
estas propiedades describen el parametro de entrada

-   `type` indica si la propiedad es un cuerpo `@Body()`, consulta `@Query()`, param @Param() p un parametro personalizado.
-   `metatye` el metatipo de la propiedad por ejemplo, String. no esta definido ya sea si omite la declaracion de tipo en la firma de funcion, o si utiliza un javascript de vainilla
-   `data` la cadena paso al decorador, por ejemplo `@Body('cadena')` no esta `undefined` si deja el parentesis vacio

>   las interfaces de TypeScript desaparecen durante la transpilacion por lo tanto si una interfaz en lugar de una clase el valor del metatipo sera igual a Objeto.

#   Cual es el punto?
centremonos en el metodo `create()` de CatsController por un tiempo

```JS
@Post()
async create(@Body() createCatDto: CreateCatDto){
    this.catsService.create(createCatDto);
}
```
hay un parametro de cuerpo `CreateCatDto`

```JS
//create-cat.dto.ts
export class CreateCatDto{
    readonly name: string;
    readonly age: number;
    readonly breed: string;
}
```

este objeto siempre tiene que ser correcto y por lo tanto debemos validar estos tres miembros prodiams hacerlo dentro del metodo del controlador de ruta pero romperiamos la regla de responsabilidad unica `(SRP)` la segunda idea es crear una clase de validador y delegar la tarea alli pero tendremos que usar este validador cada vez que comience cada metodo ¿y que hay de middleware de validacion? es una buena idea pero imposible crear un middleware generico que pueda usarse en toda la aplicacion
es el primer caso de uso cuando deberia conderar usar tuberia

# Validacion de esquema de objeto
uno de los enfoques mas frecuentes es utilizar una validacion basada en esquema la bibliotea `Joi` es una herramienta que te permite crear esquemas de una manera bastante sencilla con una `API legible` para crear una canalizacion que haga uso de esquemas de objetos necesitamos crear una clase simple que tome un esquema como un argumento de constructor.

```JS
import * as Joi from 'joi';
import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema:Object){}
  transform(value: any, metadata: ArgumentMetadata) {
    const {error} = Joi.validate(value, this.schema);
    if(error){
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}

```

# Tubos de union
la conexion de tuberas es extramadamente simple:
nevesitamos usar el decorador `@UsePipes()` y crear una instancia de tuberia con el esquema `Joi` valido;

```JS
@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CrateCatDto){
    this.catsService.create(createCatDto);
}
```
# Validador de clase
esta seccion se aplica solo TypeScript
nest funciona bien con el validador de clases esta increible biblioteca le permite utilizar la validacion basada en decorador la validacion basada en decoratos es realmente poderosa con las capacidades de tuberia ya que tenemos acceso al metatipo de la propiedad procesada sin embargo antes de comenzar necesitamos instalar los paquetes requeridos:

```Bash
npm i --save class-validator class-transformer
```
una vez que la bibliotecas esta instaladas, podemos agregar algunos decoradores a la clase CreateCatDto

cuando esta hecho, podemos crear una clase `ValidationPipe`

>   hemos utilizando la biblioteca `class-transformador` esta hecho por el mismo autor que la biblioteca de `class-validator` y como resultado juegan muy bien juntos

vatamos a traves de este codigo. en primer lugar tenga en cuanto que la funcion tranform() es asincrona. es posible porque Nest admite tuberias sincronas y asincronas ademas hay una funcion auxiliar: `toValidate()`. es responsable de excluir los tipos de Javascript nativos del proceso de validacion debido a razones de rendimiento. la ultima parte que vale la pena mencionar es que tenemos que devolver el mismo valor esta tuberia es una tuberia especifica de calidacion, por lo tanto, necesitamos devolver la misma propiedad para evitar la anulacion (como se señalo anteriormente la tuberia transforma la entrada en la salida deseada)
el ultimo paso es configurar el `ValidationPipe` las tuberias al igual que los filtros de excepcion pueden ser de ambito de metodo de controlador y de ambito global ademas una tuberia puede tener un alcance param, podemos vincular directamente la instancia de la tuberia al decorador de ruta po ejemplo al decorador `@Body()` echemos un vistazo al siguiente ejemplo

```Js
//cats.controller.ts
@Post(){
    async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto){
        this.catsService.create(createCatDto);
    }
}
```
los pipes de ambito param son utiles cuando la logica de validacion se refiere a un solo parametro especificado para configurar una tuberia a nivel de metodo, necesitara el decorador `UsePipes()`

```JS
//cats.controller.ts
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() createCatDto: CreateCatDto){
    this.catsService.create(createCatDto);
}
```
la instancia de `ValidationPipe` se ha creadp inmediatamente en el lugar. otra forma disponible es pasar la clase (no la instanciacion), dejando al marco la responsabilidad de instanciacion y habilitando la inyeccion de dependecia.

```JS
//cats.controller.ts
@Post()
@UsePipes(ValidationPipe)
async create(@Body() createCatDto: CreateCatDto){
    this.catsService.create(createCatDto);
}
```
dado que la ValidationPipe fue creado para ser tan generico como sea posible lo configuraremos como una tuberia de alcance global para cada controlador de ruta en toda la aplicacion

```JS
//main.ts
async function bootstrap(){
    const app = await NestFactory.create(ApplicationModule);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3000);
}
boostrap();
```

Las canalizaciones globales se utilizan en toda la aplicación, para cada controlador y cada controlador de ruta. En términos de inyección de dependencia, las canalizaciones globales registradas desde el exterior de cualquier módulo (como en el ejemplo anterior) no pueden inyectar dependencias ya que no pertenecen a ningún módulo. Para resolver este problema, puede configurar una tubería directamente desde cualquier módulo utilizando la siguiente construcción:

```JS
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ]
})
export class ApplicationModule {}
```

# Tubo transformador

La validación no es el único caso de uso. Al comienzo de este capítulo, hemos mencionado que una tubería también puede transformar los datos de entrada en la salida deseada. Es cierto porque el valor devuelto por la función de transformación anula completamente el valor anterior del argumento. A veces, los datos pasados del cliente deben sufrir algunos cambios. Además, algunas partes podrían perderse, por lo tanto, debemos aplicar los valores predeterminados. Las tuberías del transformador llenan el vacío entre la solicitud del cliente y el controlador de la solicitud.

```JS
//parse-int.pipe.ts
import {} from {PipeTransform, Injectable, ArgumentMetadata, BadRequestException} from '@nestjs/common';

@Injectable()
export class ParseIntPipes implements PipeTransform<string, number> {
    transform(value: string, metadata: ArgumentMetadata): number {
        const val = parseInt(value, 10);
        if(isNaN(val)){
            throw new BadRequestException('validation failed');
        }
        return val;
    }
}
```

aqui hay un `ParseIntPipe` que es responsable de analizar una cadena en un valor entero simplemente podemos atar una tuberia al parametro seleccionado:

```JS
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id){
    return await this.catService.findOne(id);
}
```

gracias a la construccion anterior, `ParseIntPipe` se ejecutara antes de que la solicitud toque el controlador correspondientes

otro caso util seria seleccionar una entidad de usuario existente de la base de datos por ID

```JS
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity){
    return userEntity;
}
```

# Un ValidationPipe incorporado

Afortunadamente, no tiene que crear esas tuberías por su cuenta ya que el ValidationPipe y el ParseIntPipe son tuberías integradas (tenga en cuenta que ValidationPipe requiere que estén instalados los paquetes del validador de clase y del transformador de clase).

El ValidationPipe incorporado ofrece más opciones que la descrita en este capítulo, que se ha mantenido básica por simplicidad y para reducir la curva de aprendizaje. Puedes ver muchos ejemplos aquí.

Si echa un vistazo a createCatDto en su función de controlador, notará que no es una instancia real de CreateCatDto. Esto se debe a que esta tubería solo valida la carga útil, sin transformarla en el tipo esperado. Sin embargo, si desea que la canalización mute la carga útil, puede configurarlo pasando las opciones apropiadas:

```JS
//cats.controller.ts
@Post()
@UsePipes(new ValidationPipe({transform: true}))
async create(@Body() createCatDto: CreateCatDto){
    this.catsService.create(createCatDto);
}
```
>   el `ValidationPipe` se importa del paquete `@nestjs/common`

debido a que esta canalizacion se basa en el validador de clase y las bibliotecas de trasformador de clase, es posible obtener mas echa un vistazo a las opciones opcionales del constructor.

```JS
export interface ValidationPipeOptions extends ValidatorOptions{
    transform?: boolean;
    disableErrorMessages?: boolean;
    exceptionFactory?: (errors: ValidationError[]) => any;
}
```

hay un atributo de transformacion y todas las opciones de validacion de clase (heredadas de la interfaz ValidatorOptions):
