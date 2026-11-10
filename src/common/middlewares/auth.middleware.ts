import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Response } from 'express';
import { JsonWebTokenError, verify } from 'jsonwebtoken';
import { CONFIG_KEYS } from '../../config/configuration';
import { AUTH_ERRORS } from '../constants/error.messages';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * ============ EXERCICE 1 : middleware d'authentification ============
 *
 * Un middleware est une fonction executee AVANT que la requete
 * n'arrive au controleur. Il a acces a (req, res, next) :
 *   - s'il appelle next()         -> la requete continue son chemin,
 *   - s'il repond avec res.json() -> le cycle s'arrete ici.
 *
 * Role de celui-ci : simuler une authentification.
 *   1. lire le header 'auth-user' qui contient un token JWT,
 *   2. le decoder avec jsonwebtoken.verify,
 *   3. en extraire la propriete userId,
 *   4. injecter ce userId dans l'objet request,
 *   5. sinon : repondre 401 "vous ne pouvez pas acceder a la ressource".
 *
 * Il est branche sur les routes d'ecriture du TodoController
 * (voir la methode configure() de AppModule).
 *
 * Ecrit sous forme de CLASSE (et non de fonction) pour deux raisons :
 * il est @Injectable, donc il peut recevoir ConfigService par injection
 * de dependances, et il est testable.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['auth-user'] as string | undefined;

    // 1. Pas de header du tout.
    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: AUTH_ERRORS.MISSING_HEADER,
      });
    }

    try {
      // 2. Verification de la signature + decodage du contenu.
      const secret = this.config.get<string>(CONFIG_KEYS.JWT_SECRET) as string;
      const payload = verify(token, secret) as { userId?: number };

      // 3. Le token est valide mais ne porte pas de userId.
      if (!payload?.userId) {
        return res.status(401).json({
          statusCode: 401,
          message: AUTH_ERRORS.MISSING_USER_ID,
        });
      }

      // 4. Injection dans la requete : les controleurs y ont acces.
      req.userId = payload.userId;
      return next();
    } catch (error) {
      // 5. Signature invalide, token expire, token mal forme...
      const message =
        error instanceof JsonWebTokenError
          ? `${AUTH_ERRORS.INVALID_TOKEN} (${error.message})`
          : AUTH_ERRORS.INVALID_TOKEN;

      return res.status(401).json({ statusCode: 401, message });
    }
  }
}
