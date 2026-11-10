import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Cv } from '../../cv/entities/cv.entity';

@Entity('skill')
export class Skill extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  designation: string;

  /**
   * Cote inverse de la relation * Cv <-> * Skill.
   * Le @JoinTable (proprietaire de la relation) est dans Cv.
   */
  @ManyToMany(() => Cv, (cv) => cv.skills)
  cvs: Cv[];
}
