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
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { SearchCvDto } from './dto/search-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Cv } from './entities/cv.entity';

/**
 * CRUD des cvs.
 *
 * A ce stade (branche master) aucune authentification n'est encore en
 * place : tout le monde peut tout faire. La branche 'auth' ajoutera les
 * guards et la regle "chacun ne voit/modifie que ses propres cvs".
 */
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto): Promise<Cv> {
    return this.cvService.createCv(createCvDto);
  }

  @Get()
  findAll(): Promise<Cv[]> {
    return this.cvService.findAll();
  }

  /**
   * GET /cv/search?critere=dev&age=30&page=1&limit=5
   * Declaree AVANT @Get(':id') : sinon Nest interpreterait "search"
   * comme un id et la route ne serait jamais atteinte.
   */
  @Get('search')
  search(@Query() searchCvDto: SearchCvDto) {
    return this.cvService.search(searchCvDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cv> {
    return this.cvService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
  ): Promise<Cv> {
    return this.cvService.updateCv(id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.cvService.remove(id);
  }
}
