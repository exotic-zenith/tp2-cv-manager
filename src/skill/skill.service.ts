import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GenericCrudService } from '../common/services/generic-crud.service';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillService extends GenericCrudService<Skill> {
  constructor(
    @InjectRepository(Skill)
    protected readonly repository: Repository<Skill>,
  ) {
    super(repository, 'Skill');
  }

  /** Utilise par CvService pour rattacher des competences a un cv. */
  findByIds(ids: number[]): Promise<Skill[]> {
    if (!ids?.length) {
      return Promise.resolve([]);
    }
    return this.repository.findBy({ id: In(ids) });
  }

  /**
   * Retourne la competence existante ou la cree.
   * Pratique pour le seed : evite les doublons de designation.
   */
  async findOrCreate(designation: string): Promise<Skill> {
    const existing = await this.repository.findOne({ where: { designation } });
    return (
      existing ?? this.repository.save(this.repository.create({ designation }))
    );
  }
}
