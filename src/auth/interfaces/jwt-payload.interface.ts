import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Contenu que l'on met dans le JWT au moment du login.
 * ATTENTION : un JWT est signe, pas chiffre. Tout le monde peut lire
 * son contenu sur https://jwt.io => on n'y met jamais le mot de passe.
 */
export interface JwtPayload {
  /** id du user : c'est la cle qui nous permet de le recharger. */
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}
