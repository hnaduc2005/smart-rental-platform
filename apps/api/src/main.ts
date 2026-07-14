import "./dotenv-init";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./modules/prisma/prisma.service";

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "");
}

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGINS,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return Array.from(new Set(configuredOrigins));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true
  });
  
  // Increase payload limit to 10MB to support base64 image uploads
  const express = require("express");
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
