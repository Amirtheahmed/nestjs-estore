import {NestFactory, Reflector} from '@nestjs/core';
import { AppModule } from './app.module';
import {ClassSerializerInterceptor, ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerDocumentOptions, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    //forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(
      app.get(Reflector))
  );

  const config = new DocumentBuilder()
      .setTitle('NestJS - E-Store')
      .setDescription('E-Store API Documentation')
      .setVersion('1.0')
      .build();

  const options: SwaggerDocumentOptions =  {
    operationIdFactory: (
        controllerKey: string,
        methodKey: string
    ) => methodKey
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
