import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
    // create / findAll / findOneById / update / remove / restore sont
    // heritees de GenericCrudService : on ne les reecrit pas ici.
    super(repository, 'Cv');
  }

  /**
   * Creation d'un cv avec rattachement des competences (ManyToMany).
   * Le proprietaire (user) est optionnel a ce stade : il sera impose
   * par le user connecte sur la branche 'auth'.
   */
  async createCv(createCvDto: CreateCvDto, user?: User): Promise<Cv> {
    const { skillIds, ...cvData } = createCvDto;

    const cv = this.repository.create({
      ...cvData,
      ...(user ? { user } : {}),
      skills: await this.skillService.findByIds(skillIds ?? []),
    });

    return this.repository.save(cv);
  }

  async updateCv(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOneById(id);

    const { skillIds, ...cvData } = updateCvDto;
    const updated = this.repository.merge(cv, cvData);

    // Un tableau skillIds fourni (meme vide) remplace les competences.
    if (skillIds) {
      updated.skills = await this.skillService.findByIds(skillIds);
    }

    return this.repository.save(updated);
  }

  /** Recherche paginee sur name / firstname / job et sur l'age. */
  async search(
    searchCvDto: SearchCvDto,
  ): Promise<{ page: number; limit: number; total: number; data: Cv[] }> {
    const { critere, age, page = 1, limit = 10 } = searchCvDto;

    const query = this.repository
      .createQueryBuilder('cv')
      .leftJoinAndSelect('cv.user', 'user')
      .leftJoinAndSelect('cv.skills', 'skill');

    if (critere) {
      // Brackets regroupe les OR entre parentheses, sinon ils
      // annuleraient les AND precedents.
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
}
