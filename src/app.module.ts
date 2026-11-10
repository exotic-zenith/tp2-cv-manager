import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { CONFIG_KEYS } from './config/configuration';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // Charge le .env et rend ConfigService disponible dans toute l'app.
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),

    // Connexion unique a MySQL, declaree une seule fois a la racine.
    // Version "Async" : la fabrique est appelee APRES le chargement du
    // .env, donc les variables sont garanties presentes.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>(CONFIG_KEYS.DB_HOST),
        port: Number(config.get<string>(CONFIG_KEYS.DB_PORT) ?? 3306),
        username: config.get<string>(CONFIG_KEYS.DB_USER),
        password: config.get<string>(CONFIG_KEYS.DB_PASSWORD),
        database: config.get<string>(CONFIG_KEYS.DB_NAME),
        // Chaque module declare ses entites via forFeature : on les
        // charge automatiquement au lieu de les lister ici.
        autoLoadEntities: true,
        // synchronize regenere le schema a partir des entites a chaque
        // demarrage. Pratique en TP, a NE JAMAIS activer en production.
        synchronize: true,
      }),
    }),

    UserModule,
    SkillModule,
    CvModule,
    TodoModule,
  ],
  controllers: [AppController],
  // AuthMiddleware est declare ici pour que Nest puisse l'instancier
  // avec ses dependances (ConfigService) au moment du .apply().
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  /**
   * ============ EXERCICE 1 : branchement du middleware ============
   *
   * Pour appliquer un middleware, le module doit implementer NestModule
   * et sa methode configure(consumer).
   *
   * .apply(...)     : quel middleware,
   * .forRoutes(...) : sur quelles routes / quels verbes HTTP.
   *
   * Ici on le limite a "la partie persistance" du TodoController,
   * c'est-a-dire POST / PATCH / PUT / DELETE. Les GET restent libres.
   * (On aurait aussi pu ecrire .forRoutes(TodoController) pour couvrir
   * tout le controleur, verbes de lecture compris.)
   *
   * --------------------------------------------------------------
   * BRANCHE auth : le TP demande de DESACTIVER ce middleware, car
   * Passport et les guards prennent le relais. Il suffit alors de
   * commenter le bloc consumer.apply(...) ci-dessous.
   * --------------------------------------------------------------
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'todo', method: RequestMethod.POST },
        { path: 'todo/:id', method: RequestMethod.PATCH },
        { path: 'todo/:id', method: RequestMethod.PUT },
        { path: 'todo/:id', method: RequestMethod.DELETE },
      );
  }
}
