import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = [
    ...(process.env.ADMIN_ORIGIN?.split(',') ?? []),
    ...(process.env.FRONTEND_ORIGIN?.split(',') ?? []),
  ]
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const uploadsPath = '/uploads';
  const publicBase =
    process.env.PUBLIC_BASE_URL?.replace(/\/$/, '') ??
    `http://127.0.0.1:${port}`;
  console.log(`Server is running on port ${port}`);
  console.log(`Static uploads: ${publicBase}${uploadsPath}/`);
}

void bootstrap();
