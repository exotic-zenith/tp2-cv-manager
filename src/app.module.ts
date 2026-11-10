import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
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
        type: 'mysql' as const,
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/**
 * ===================================================================
 * BRANCHE auth : LE MIDDLEWARE EST DESACTIVE (demande explicite du TP)
 * ===================================================================
 *
 * Sur la branche master, cette classe implementait NestModule et
 * branchait AuthMiddleware sur les routes d'ecriture de /todo :
 *
 *   export class AppModule implements NestModule {
 *     configure(consumer: MiddlewareConsumer): void {
 *       consumer
 *         .apply(AuthMiddleware)
 *         .forRoutes(
 *           { path: 'todo',     method: RequestMethod.POST },
 *           { path: 'todo/:id', method: RequestMethod.PATCH },
 *           { path: 'todo/:id', method: RequestMethod.PUT },
 *           { path: 'todo/:id', method: RequestMethod.DELETE },
 *         );
 *     }
 *   }
 *
 * On le desactive ici parce que l'authentification "simulee" du
 * middleware est remplacee par une vraie authentification :
 * Passport + la strategie JWT + les guards (JwtAuthGuard, RolesGuard).
 *
 * Pourquoi un Guard plutot qu'un Middleware ?
 *  - un middleware est une brique Express : il ne connait ni le
 *    controleur ni la methode appelee, donc il ne peut pas lire les
 *    metadata posees par @Roles(...) ;
 *  - un guard recoit l'ExecutionContext : il sait quelle route est
 *    visee, peut interroger le Reflector et s'integre a l'injection
 *    de dependances de Nest.
 *
 * Le fichier src/common/middlewares/auth.middleware.ts est conserve
 * tel quel : il reste la reponse a l'exercice 1 et il suffit de
 * remettre le bloc configure() ci-dessus pour le reactiver.
 */
