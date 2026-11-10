import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_ERRORS } from '../constants/error.messages';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * ============ EXERCICE : notre propre Guard (RBAC) ============
 *
 * Un Guard est une classe qui implemente CanActivate. Sa methode
 * canActivate repond a une seule question : "cette requete a-t-elle le
 * droit d'atteindre le controleur ?". true => oui, false/exception => non.
 *
 * Remarque du TP : "le proprietaire de l'application peut ajouter des
 * roles a tout moment, pensez-y quand vous implementez votre Guard".
 * => On ne code donc JAMAIS 'admin' en dur ici. Le guard lit les roles
 *    exiges dans les metadata posees par @Roles(...) et les compare au
 *    role du user connecte. Ajouter un role demain = ajouter une valeur
 *    dans l'enum UserRole et l'utiliser dans @Roles() : ce fichier ne
 *    change pas.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // getAllAndOverride : on regarde d'abord la methode, puis la classe.
    // Les roles poses sur une route precise ecrasent ceux du controleur.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Aucune contrainte de role sur cette route => on laisse passer.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Le RolesGuard s'utilise APRES le JwtAuthGuard : si user est vide,
    // c'est que personne n'est authentifie.
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.NOT_AUTHENTICATED);
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(AUTH_ERRORS.FORBIDDEN_ROLE);
    }

    return true;
  }
}
