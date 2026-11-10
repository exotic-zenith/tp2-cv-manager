import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AUTH_ERRORS } from '../common/constants/error.messages';
import { UserRole } from '../common/enums/user-role.enum';
import { GenericCrudService } from '../common/services/generic-crud.service';
import { SkillService } from '../skill/skill.service';
import { User } from '../user/entities/user.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { SearchCvDto } from './dto/search-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';

@Injectable()
export class CvService extends GenericCrudService<Cv> {
  constructor(
    @InjectRepository(Cv)
    protected readonly repository: Repository<Cv>,
    private readonly skillService: SkillService,
  ) {
    super(repository, 'Cv');
  }

  /**
   * Creation d'un cv : le proprietaire n'est JAMAIS envoye par le
   * client, il est impose par le serveur a partir du user connecte.
   * (Sinon n'importe qui pourrait creer un cv au nom d'un autre.)
   */
  async createForUser(createCvDto: CreateCvDto, user: User): Promise<Cv> {
    const { skillIds, ...cvData } = createCvDto;

    const cv = this.repository.create({
      ...cvData,
      user,
      skills: await this.skillService.findByIds(skillIds ?? []),
    });

    return this.repository.save(cv);
  }

  /**
   * Liste des cvs selon le role :
   *  - ADMIN : tous les cvs de l'application,
   *  - USER  : uniquement les siens.
   */
  findAllForUser(user: User): Promise<Cv[]> {
    if (this.isAdmin(user)) {
      return this.repository.find();
    }
    return this.repository.find({ where: { user: { id: user.id } } });
  }

  /** Lecture d'un cv precis, avec controle de propriete. */
  async findOneForUser(id: number, user: User): Promise<Cv> {
    const cv = await this.findOneById(id);
    this.assertCanManage(cv, user);
    return cv;
  }

  async updateForUser(
    id: number,
    updateCvDto: UpdateCvDto,
    user: User,
  ): Promise<Cv> {
    const cv = await this.findOneById(id);
    this.assertCanManage(cv, user);

    const { skillIds, ...cvData } = updateCvDto;
    const updated = this.repository.merge(cv, cvData);

    // Un tableau skillIds fourni (meme vide) remplace les competences.
    if (skillIds) {
      updated.skills = await this.skillService.findByIds(skillIds);
    }

    return this.repository.save(updated);
  }

  async removeForUser(id: number, user: User): Promise<{ message: string }> {
    const cv = await this.findOneById(id);
    this.assertCanManage(cv, user);
    await this.repository.softRemove(cv);
    return { message: `Cv d'id ${id} supprime avec succes.` };
  }

  /** Recherche paginee (admin : global, user : limitee a ses cvs). */
  async search(
    searchCvDto: SearchCvDto,
    user: User,
  ): Promise<{ page: number; limit: number; total: number; data: Cv[] }> {
    const { critere, age, page = 1, limit = 10 } = searchCvDto;

    const query = this.repository
      .createQueryBuilder('cv')
      .leftJoinAndSelect('cv.user', 'user')
      .leftJoinAndSelect('cv.skills', 'skill');

    if (!this.isAdmin(user)) {
      query.andWhere('user.id = :userId', { userId: user.id });
    }

    if (critere) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('cv.name LIKE :critere', { critere: `%${critere}%` })
            .orWhere('cv.firstname LIKE :critere', { critere: `%${critere}%` })
            .orWhere('cv.job LIKE :critere', { critere: `%${critere}%` });
        }),
      );
    }

    if (age) {
      query.andWhere('cv.age = :age', { age });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { page, limit, total, data };
  }

  private isAdmin(user: User): boolean {
    return user?.role === UserRole.ADMIN;
  }

  /**
   * Regle metier centrale du TP : un user ne peut modifier/supprimer
   * que SES cvs. L'admin, lui, n'est pas limite.
   */
  private assertCanManage(cv: Cv, user: User): void {
    if (this.isAdmin(user)) {
      return;
    }
    if (cv.user?.id !== user.id) {
      throw new ForbiddenException(AUTH_ERRORS.NOT_OWNER);
    }
  }
}
