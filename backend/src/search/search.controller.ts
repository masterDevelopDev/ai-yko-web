import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultsWithRefinementFiltersDto } from './dto/search-result.dto';
import { File, FilesInterceptor } from '@nest-lab/fastify-multer';
import { SearchService } from './search.service';
import { DocumentExportRequestDto } from './dto/document-export.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { CreateSavedSearchResponseDto } from './dto/create-saved-search-response.dto';
import { SavedSearchDto } from './dto/saved-search.dto';
import { UploadJunkImagesDto } from './dto/upload-junk-images.dto';
import { Roles } from '../iam/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Auth(AuthType.JwtCookie)
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @Post()
  @UseInterceptors(FilesInterceptor('imageFiles'))
  async search(
    @Body() body: SearchQueryDto,
    @ActiveUser() user: ActiveUserData,
    @UploadedFiles() imageFiles: File[],
  ): Promise<SearchResultsWithRefinementFiltersDto> {
    return this.searchService.search(body, user, imageFiles);
  }

  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @Post('save')
  @UseInterceptors(FilesInterceptor('imageFiles'))
  async saveSearchQuery(
    @Body() body: SearchQueryDto,
    @ActiveUser() user: ActiveUserData,
    @UploadedFiles() imageFiles: File[],
  ): Promise<CreateSavedSearchResponseDto> {
    return this.searchService.saveSearchQuery(body, user, imageFiles);
  }

  @Roles(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @Post('upload-junk-images')
  @UseInterceptors(FilesInterceptor('imageFiles'))
  async uploadJunkImages(
    @Body() _: UploadJunkImagesDto,
    @ActiveUser() user: ActiveUserData,
    @UploadedFiles() imageFiles: File[],
  ): Promise<void> {
    return this.searchService.uploadJunkImages(user, imageFiles);
  }

  @Get('saved-searches')
  async getSavedSearchQueries(
    @ActiveUser() user: ActiveUserData,
  ): Promise<SavedSearchDto[]> {
    return this.searchService.getSavedSearches(user);
  }

  @Get('saved-search/:id')
  async getSavedSearch(
    @ActiveUser() user: ActiveUserData,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<SavedSearchDto> {
    return this.searchService.getSavedSearch(user, +id);
  }

  @Post('saved-searches/:id')
  async updateSavedSearch(
    @ActiveUser() user: ActiveUserData,
    @Body() body: UpdateSavedSearchDto,
    @Param('id', ParseIntPipe) id: string,
  ) {
    return this.searchService.updateSavedSearch(user, +id, body);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('saved-searches/:id')
  async deleteSavedSearchQuery(
    @ActiveUser() user: ActiveUserData,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<void> {
    return this.searchService.deleteSavedSearchQuery(user, +id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('export')
  async exportSearchResult(
    @Body() documentExportRequestDto: DocumentExportRequestDto,
  ): Promise<string> {
    return this.searchService.exportSearchResult(documentExportRequestDto);
  }
}
