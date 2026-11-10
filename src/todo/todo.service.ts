import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AUTH_ERRORS } from '../common/constants/error.messages';
import { GenericCrudService } from '../common/services/generic-crud.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService extends GenericCrudService<Todo> {
  constructor(
    @InjectRepository(Todo)
    protected readonly repository: Repository<Todo>,
  ) {
    super(repository, 'Todo');
  }

  /**
   * Exercice 1 : a l'ajout on rattache le todo au user dont l'id a ete
   * extrait du token par le middleware.
   */
  createForUser(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.repository.create({
      ...createTodoDto,
      user: { id: userId },
    });
    return this.repository.save(todo);
  }

  async updateForUser(
    id: number,
    updateTodoDto: UpdateTodoDto,
    userId: number,
  ): Promise<Todo> {
    const todo = await this.findOneById(id);
    this.assertIsOwner(todo, userId);
    return this.repository.save(this.repository.merge(todo, updateTodoDto));
  }

  async removeForUser(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const todo = await this.findOneById(id);
    this.assertIsOwner(todo, userId);
    await this.repository.softRemove(todo);
    return { message: `Todo d'id ${id} supprime avec succes.` };
  }

  /** Seul le createur du todo peut le modifier ou le supprimer. */
  private assertIsOwner(todo: Todo, userId: number): void {
    if (todo.user?.id !== userId) {
      throw new ForbiddenException(AUTH_ERRORS.NOT_OWNER);
    }
  }
}
