import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard d'authentification.
 *
 * AuthGuard('jwt') est fourni par Passport : il declenche la JwtStrategy,
 * qui lit le header Authorization: Bearer <token>, le verifie, et met le
 * user dans request.user. Si le token manque ou est invalide => 401.
 *
 * On l'enveloppe dans une classe nommee uniquement pour la lisibilite :
 * @UseGuards(JwtAuthGuard) se lit mieux que @UseGuards(AuthGuard('jwt')).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
