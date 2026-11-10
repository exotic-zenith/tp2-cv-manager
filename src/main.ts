import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * ValidationPipe global : tous les @Body()/@Query() types par un DTO
   * sont automatiquement valides par class-validator.
   *   whitelist             : supprime les champs non declares dans le DTO,
   *   forbidNonWhitelisted  : et renvoie meme une 400 s'il y en a,
   *   transform             : convertit le JSON en vraie instance de DTO
   *                           (c'est ce qui fait marcher @Type(() => Number)).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = app.get(ConfigService).get<string>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Application demarree sur : http://localhost:${port}`);
}
void bootstrap();
