import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AUTH_ERRORS } from '../common/constants/error.messages';
import { CONFIG_KEYS } from '../config/configuration';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * INSCRIPTION.
   * On delegue a UserService : c'est lui qui verifie l'unicite et
   * qui hache le mot de passe avec bcrypt. On ne duplique rien.
   */
  async signup(signupDto: SignupDto): Promise<User> {
    return this.userService.create(signupDto);
  }

  /**
   * CONNEXION, en suivant exactement les 4 etapes du cours :
   *  1. recuperer les donnees d'authentification,
   *  2. verifier que le user existe,
   *  3. comparer le mot de passe envoye au hash stocke,
   *  4. si tout est bon -> on signe un JWT, sinon -> UnauthorizedException.
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; expiresIn: number; user: Partial<User> }> {
    const { identifiant, password } = loginDto;

    const user = await this.userService.findForAuthentication(identifiant);
    if (!user) {
      // Meme message que pour un mauvais mot de passe : on evite de
      // reveler quels comptes existent.
      throw new UnauthorizedException(AUTH_ERRORS.BAD_CREDENTIALS);
    }

    // bcrypt.compare rehache le mot de passe saisi avec le meme salt
    // (stocke dans le hash) et compare les deux resultats.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException(AUTH_ERRORS.BAD_CREDENTIALS);
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      expiresIn: Number(
        this.config.get<string>(CONFIG_KEYS.JWT_EXPIRES_IN) ?? 3600,
      ),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Appelee par la JwtStrategy a chaque requete protegee : on recharge
   * le user depuis la base pour travailler sur des donnees a jour
   * (role modifie, compte supprime...).
   */
  async validatePayload(payload: JwtPayload): Promise<User> {
    try {
      return await this.userService.findOneById(payload.userId);
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }
  }
}
