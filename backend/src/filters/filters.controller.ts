import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterDto } from './dto/filter.dto';
import { FindAllFiltersQueryDto } from './dto/find-all-filters-query.dto';
import { FilterGroupWithMappingDto } from '../search/dto/filters.dto';
import { CategoryDto } from './dto/category.dto';
import { Role } from '@prisma/client';
import { Roles } from '../iam/decorators/roles.decorator';

@Roles(Role.ADMIN)
@ApiTags('filters')
@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Post()
  create(@Body() createFilterDto: CreateFilterDto) {
    return this.filtersService.create(createFilterDto);
  }

  @Roles(Role.USER, Role.OPERATOR, Role.ADMIN)
  @Get('tree')
  getFiltersTree(
    @Query('categoryId') categoryId: string,
  ): Promise<FilterGroupWithMappingDto> {
    return this.filtersService.getFiltersTree(categoryId);
  }

  @Roles(Role.USER, Role.OPERATOR, Role.ADMIN)
  @Get('categories')
  getCategories(): Promise<CategoryDto[]> {
    return this.filtersService.getCategories();
  }

  @Get()
  findAll(@Query() query: FindAllFiltersQueryDto): Promise<FilterDto[]> {
    return this.filtersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filtersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilterDto: UpdateFilterDto) {
    return this.filtersService.update(id, updateFilterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filtersService.remove(id);
  }
}
