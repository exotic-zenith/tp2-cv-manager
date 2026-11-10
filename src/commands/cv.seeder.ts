import { NestFactory } from '@nestjs/core';
import {
  randCity,
  randEmail,
  randFirstName,
  randJobTitle,
  randLastName,
  randNumber,
  randUserName,
} from '@ngneat/falso';
import { AppModule } from '../app.module';
import { CvService } from '../cv/cv.service';
import { SkillService } from '../skill/skill.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

/**
 * ============ EXERCICE : seed via une STANDALONE APPLICATION ============
 *
 * Une application "standalone" est une application Nest SANS serveur HTTP :
 * c'est juste le conteneur d'injection de dependances (IOC) de Nest.
 * On y recupere nos services exactement comme dans un controleur, mais
 * depuis un simple script en ligne de commande.
 *
 *   createApplicationContext(AppModule) -> demarre le conteneur
 *   app.get(MonService)                 -> recupere une instance
 *   app.close()                         -> ferme proprement (connexion BD)
 *
 * Important : tous les imports doivent etre RELATIFS (./ ou ../) et non
 * absolus, sinon ts-node ne saura pas les resoudre.
 *
 * Lancement :  npm run seed:cvs
 */

/** Referentiel de competences insere une seule fois. */
const SKILLS = [
  'JavaScript',
  'TypeScript',
  'NestJs',
  'Angular',
  'React',
  'MySQL',
  'MongoDB',
  'Docker',
  'Git',
  'Linux',
];

const NB_USERS = 5;
const NB_CVS_PAR_USER = 3;

/** Tire n elements au hasard dans un tableau. */
function piocherAuHasard<T>(source: T[], nombre: number): T[] {
  return [...source].sort(() => Math.random() - 0.5).slice(0, nombre);
}

async function bootstrap() {
  // 1. On demarre le conteneur Nest, sans serveur HTTP.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  // 2. On recupere les services exportes par nos modules.
  const userService = app.get(UserService);
  const skillService = app.get(SkillService);
  const cvService = app.get(CvService);

  try {
    console.log('--- Seed des competences ---');
    const skills = await Promise.all(
      SKILLS.map((designation) => skillService.findOrCreate(designation)),
    );
    console.log(`${skills.length} competences disponibles.`);

    console.log('--- Seed des utilisateurs et de leurs cvs ---');
    for (let i = 0; i < NB_USERS; i++) {
      const user = await creerUserSiAbsent(userService, {
        username: `${randUserName()}_${i}`,
        email: `user${i}_${randEmail()}`,
        password: 'user123',
      });

      for (let j = 0; j < NB_CVS_PAR_USER; j++) {
        const cv = await cvService.createCv(
          {
            name: randLastName(),
            firstname: randFirstName(),
            age: randNumber({ min: 18, max: 60 }),
            // Un CIN unique : derive du compteur + horodatage.
            cin: `${randNumber({ min: 10, max: 99 })}${Date.now()
              .toString()
              .slice(-4)}${i}${j}`,
            job: randJobTitle(),
            path: `https://picsum.photos/seed/${randCity()}/200`,
            skillIds: piocherAuHasard(skills, 3).map((skill) => skill.id),
          },
          user,
        );
        console.log(`  cv #${cv.id} -> ${user.username}`);
      }
    }

    console.log('Seed termine avec succes.');
  } catch (error) {
    console.error('Echec du seed :', error);
    process.exitCode = 1;
  } finally {
    // 3. Toujours fermer : sinon le process reste bloque sur la BD.
    await app.close();
  }
}

/** Idempotence : relancer le seed ne doit pas planter sur les uniques. */
async function creerUserSiAbsent(
  userService: UserService,
  data: { username: string; email: string; password: string },
): Promise<User> {
  const existing = await userService.findForAuthentication(data.username);
  return existing ?? userService.create(data);
}

void bootstrap();
