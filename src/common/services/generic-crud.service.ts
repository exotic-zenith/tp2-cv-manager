import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

/**
 * ========================= FACTORISATION =========================
 * Le TP demande explicitement de factoriser le code pour ne pas
 * reecrire la meme chose dans chaque service.
 *
 * Toutes nos ressources (Cv, Skill, User, Todo) ont besoin des memes
 * 6 operations : create / findAll / findOne / update / remove / restore.
 * On les ecrit donc UNE SEULE FOIS ici, dans une classe generique,
 * et chaque service metier en herite (extends).
 *
 * <T> est un "type generique" : c'est l'entite manipulee.
 * Exemple : CvService extends GenericCrudService<Cv>.
 * =================================================================
 */
export abstract class GenericCrudService<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    /** Nom lisible de l'entite, utilise dans les messages d'erreur. */
    protected readonly entityName: string,
    /** Relations chargees par defaut lors des lectures. */
    protected readonly defaultRelations: string[] = [],
  ) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll(where?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({
      where,
      relations: this.defaultRelations,
    });
  }

  /**
   * Retourne l'entite ou leve une 404. Toutes les methodes qui ont
   * besoin d'une entite existante passent par ici.
   */
  async findOneById(id: number, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: this.defaultRelations,
      ...options,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} d'id ${id} introuvable.`);
    }

    return entity;
  }

  async update(id: number, dto: DeepPartial<T>): Promise<T> {
    const entity = await this.findOneById(id);
    // merge = on recopie dans l'entite existante uniquement les champs envoyes
    const updated = this.repository.merge(entity, dto);
    return this.repository.save(updated);
  }

  /** Suppression logique : la ligne reste en base avec un deletedAt rempli. */
  async remove(id: number): Promise<{ message: string }> {
    const entity = await this.findOneById(id);
    await this.repository.softRemove(entity);
    return { message: `${this.entityName} d'id ${id} supprime avec succes.` };
  }

  async restore(id: number): Promise<T> {
    const result = await this.repository.restore(id);
    if (!result.affected) {
      throw new BadRequestException(
        `${this.entityName} d'id ${id} introuvable ou non supprime.`,
      );
    }
    return this.findOneById(id);
  }
}
