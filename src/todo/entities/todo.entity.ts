import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { StatusEnum } from '../../common/enums/status.enum';
import { User } from '../../user/entities/user.entity';

@Entity('todo')
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.PENDING })
  status: StatusEnum;

  /**
   * Proprietaire du todo. C'est le middleware d'authentification
   * (exercice 1) qui le remplit a partir du userId extrait du token.
   */
  @ManyToOne(() => User, (user) => user.todos, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  user: User;
}
