import { Request } from 'express';
import { User } from '../../user/entities/user.entity';

/**
 * Express ne connait pas les proprietes que NOUS ajoutons a la requete.
 * On etend donc son type pour que TypeScript accepte :
 *  - req.userId : injecte par notre AuthMiddleware (exercice 1)
 *  - req.user   : injecte par Passport apres validation du JWT
 */
export interface AuthenticatedRequest extends Request {
  userId?: number;
  user?: User;
}
