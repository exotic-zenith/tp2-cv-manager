import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_KEYS } from '../config/configuration';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/**
 * La strategie dit a Passport :
 *  - OU trouver le token        -> header "Authorization: Bearer <token>",
 *  - AVEC QUOI le verifier      -> la cle secrete JWT_SECRET,
 *  - QUOI FAIRE une fois valide -> la methode validate().
 *
 * Point cle du cours : ce que validate() retourne est automatiquement
 * injecte par Nest dans request.user. C'est exactement pour cela que
 * notre decorateur @CurrentUser() fonctionne dans tous les controleurs.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>(CONFIG_KEYS.JWT_SECRET) as string,
    });
  }

  /** Appelee a chaque requete protegee, avec le contenu du token. */
  async validate(payload: JwtPayload): Promise<User> {
    return this.authService.validatePayload(payload);
  }
}
