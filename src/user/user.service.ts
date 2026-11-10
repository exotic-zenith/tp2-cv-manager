import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Not, Repository } from 'typeorm';
import { AUTH_ERRORS } from '../common/constants/error.messages';
import { GenericCrudService } from '../common/services/generic-crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends GenericCrudService<User> {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
  ) {
    // On passe au parent : le repository, le nom lisible de l'entite
    // et les relations a charger par defaut.
    super(repository, 'User');
  }

  /**
   * Creation d'un user : on verifie l'unicite puis on hache le mot de
   * passe AVANT de l'enregistrer. Le hachage est fait ici (et pas dans
   * le controleur) pour qu'il soit impossible de l'oublier.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.assertUnique(createUserDto.username, createUserDto.email);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.repository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.repository.save(user);
    return this.findOneById(saved.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    await this.assertUnique(updateUserDto.username, updateUserDto.email, id);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.repository.save(this.repository.merge(user, updateUserDto));
  }

  /**
   * Recherche par username OU email, avec le mot de passe hache.
   * addSelect est obligatoire car la colonne password est declaree
   * avec select: false dans l'entite.
   */
  findForAuthentication(identifiant: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :identifiant', { identifiant })
      .orWhere('user.email = :identifiant', { identifiant })
      .getOne();
  }

  /** Leve une 409 si le username ou l'email est deja pris. */
  private async assertUnique(
    username?: string,
    email?: string,
    ignoreId?: number,
  ): Promise<void> {
    const idFilter = ignoreId ? Not(ignoreId) : undefined;

    if (username) {
      const exists = await this.repository.findOne({
        where: { username, ...(idFilter ? { id: idFilter } : {}) },
      });
      if (exists) {
        throw new ConflictException(AUTH_ERRORS.USERNAME_TAKEN);
      }
    }

    if (email) {
      const exists = await this.repository.findOne({
        where: { email, ...(idFilter ? { id: idFilter } : {}) },
      });
      if (exists) {
        throw new ConflictException(AUTH_ERRORS.EMAIL_TAKEN);
      }
    }
  }
}
