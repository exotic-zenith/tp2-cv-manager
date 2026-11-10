import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Cv } from '../../cv/entities/cv.entity';
import { Todo } from '../../todo/entities/todo.entity';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  /**
   * select: false => par defaut TypeORM NE RAMENE PAS cette colonne.
   * Ainsi un GET /user ne renverra jamais le mot de passe hache.
   */
  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  /** Relation 1 User -> * Cv (cote "un"). */
  @OneToMany(() => Cv, (cv) => cv.user)
  cvs: Cv[];

  /** Relation 1 User -> * Todo, utilisee par l'exercice du middleware. */
  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];
}
