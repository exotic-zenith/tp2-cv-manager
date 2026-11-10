import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { SearchCvDto } from './dto/search-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';

/**
 * Le guard est pose au niveau du CONTROLEUR : toutes les routes de
 * /cv exigent donc un JWT valide. C'est la demande du TP
 * "proteger les fonctionnalites accessibles uniquement aux personnes
 * connectees".
 *
 * Le filtrage admin / proprietaire est ensuite fait dans le service.
 */
@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  /** POST /cv : le proprietaire est le user connecte. */
  @Post()
  create(
    @Body() createCvDto: CreateCvDto,
    @CurrentUser() user: User,
  ): Promise<Cv> {
    return this.cvService.createForUser(createCvDto, user);
  }

  /** GET /cv : admin -> tous les cvs, user -> seulement les siens. */
  @Get()
  findAll(@CurrentUser() user: User): Promise<Cv[]> {
    return this.cvService.findAllForUser(user);
  }

  /** GET /cv/search?critere=dev&age=30&page=1&limit=5 */
  @Get('search')
  search(@Query() searchCvDto: SearchCvDto, @CurrentUser() user: User) {
    return this.cvService.search(searchCvDto, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<Cv> {
    return this.cvService.findOneForUser(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @CurrentUser() user: User,
  ): Promise<Cv> {
    return this.cvService.updateForUser(id, updateCvDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.cvService.removeForUser(id, user);
  }
}
