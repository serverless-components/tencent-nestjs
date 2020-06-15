import { NestFactory } from '@nestjs/core';
import {
  NestExpressApplication,
  ExpressAdapter,
} from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

//
const createServerlessApp = async (): Promise<NestExpressApplication> => {
  const expressApp = express();

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
  );
  app.enableCors();
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.init();
  return app;
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.setViewEngine('hbs');

  await app.listen(3000);
}

if (process.env.NODE_ENV === 'local') {
  bootstrap();
} else {
  module.exports = createServerlessApp;
}
