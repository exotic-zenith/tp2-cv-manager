import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
// 'import type' : AuthenticatedRequest est une interface, elle n'existe
// qu'a la compilation. Sans ce mot-cle, TypeScript refuse de la voir
// apparaitre dans la signature d'une methode decoree.
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';

/**
 * ============ EXERCICE 1 (suite) ============
 *
 * Ce controleur ne porte AUCUN guard : c'est le AuthMiddleware branche
 * dans AppModule.configure() qui protege les routes d'ecriture
 * (POST / PATCH / DELETE) et qui remplit req.userId.
 *
 * On lit donc le user via @Req() ici, volontairement, pour montrer la
 * difference avec le module Cv qui, lui, utilise Passport + @CurrentUser.
 *
 * Le "!" apres req.userId indique a TypeScript que la valeur est forcement
 * presente : le middleware a deja repondu 401 dans le cas contraire.
 */
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /** Lecture libre : le middleware n'est pas branche sur les GET. */
  @Get()
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todoService.findOneById(id);
  }

  /** A l'ajout, on rattache le todo au user extrait du token. */
  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Todo> {
    return this.todoService.createForUser(createTodoDto, req.userId!);
  }

  /** Seul le createur du todo peut le modifier. */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Todo> {
    return this.todoService.updateForUser(id, updateTodoDto, req.userId!);
  }

  /** Seul le createur du todo peut le supprimer. */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.todoService.removeForUser(id, req.userId!);
  }
}
