import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';

/**
 * BRANCHE auth : le AuthMiddleware ayant ete desactive, ce controleur
 * passe lui aussi par Passport.
 *
 * Avant (master) :   req.userId rempli par le middleware
 * Maintenant     :   @UseGuards(JwtAuthGuard) + @CurrentUser('id')
 *
 * La regle metier, elle, n'a pas bouge : a l'ajout on rattache le todo
 * au user connecte, et seul son createur peut le modifier/supprimer.
 */
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /** Lecture libre : pas de guard sur les GET. */
  @Get()
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todoService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser('id') userId: number,
  ): Promise<Todo> {
    return this.todoService.createForUser(createTodoDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser('id') userId: number,
  ): Promise<Todo> {
    return this.todoService.updateForUser(id, updateTodoDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ): Promise<{ message: string }> {
    return this.todoService.removeForUser(id, userId);
  }
}
