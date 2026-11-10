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
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillService } from './skill.service';

/**
 * Le referentiel des competences est commun a toute l'application :
 * tout utilisateur connecte peut le consulter, mais seul un ADMIN
 * peut le modifier. D'ou les deux guards : JwtAuthGuard authentifie,
 * RolesGuard verifie le role exige par @Roles(...).
 */
@Controller('skill')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createSkillDto: CreateSkillDto): Promise<Skill> {
    return this.skillService.create(createSkillDto);
  }

  @Get()
  findAll(): Promise<Skill[]> {
    return this.skillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Skill> {
    return this.skillService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.skillService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.skillService.remove(id);
  }
}
