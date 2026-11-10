import { CreateUserDto } from '../../user/dto/create-user.dto';

/**
 * L'inscription utilise exactement les memes regles de validation que
 * la creation d'un user : on herite au lieu de dupliquer.
 * (On pourrait y retirer 'role' avec OmitType si on voulait interdire
 * a un visiteur de s'inscrire directement en tant qu'admin.)
 */
export class SignupDto extends CreateUserDto {}
