import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Classe de base (abstraite) factorisant les colonnes techniques
 * communes a toutes nos entites : date de creation, de modification
 * et de suppression logique (soft delete).
 *
 * Elle est abstraite car elle ne doit jamais devenir une table :
 * elle sert uniquement a etre heritee (extends) par les vraies entites.
 */
export abstract class BaseEntity {
  @CreateDateColumn({ update: false })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
