import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { LoggingInterceptor } from "./libs/interceptor/Logging.interceptor";
import { graphqlUploadExpress } from "graphql-upload";
import * as express from "express";
import { WsAdapter } from "@nestjs/platform-ws";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: true, credentials: true });

  app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));
  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));
  // console.log("Serving static files from:", join(__dirname, "..", "uploads"));

  app.use("/uploads", express.static("./uploads"));

  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
