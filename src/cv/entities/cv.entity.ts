import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { User } from '../../user/entities/user.entity';

@Entity('cv')
export class Cv extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  cin: string;

  @Column({ type: 'varchar', length: 100 })
  job: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  path: string;

  /**
   * Relation * Cv -> 1 User.
   * onDelete CASCADE : si on supprime un user, ses cvs partent avec lui.
   * eager: true : le user est systematiquement charge avec le cv,
   * ce dont on a besoin pour verifier le proprietaire.
   */
  @ManyToOne(() => User, (user) => user.cvs, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  user: User;

  /**
   * Relation * Cv <-> * Skill.
   * @JoinTable designe ce cote comme proprietaire : c'est lui qui
   * cree la table de jointure cv_skill(cvId, skillId).
   */
  @ManyToMany(() => Skill, (skill) => skill.cvs, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinTable({ name: 'cv_skill' })
  skills: Skill[];
}
