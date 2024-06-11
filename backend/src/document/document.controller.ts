import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiConflictResponse, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';
import { CreateDocumentResponseDto } from './dto/create-document-response.dto';
import { IndexationStatusDto } from './dto/indexation-status.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { DeleteDocumentsDto } from './dto/delete-documents.dto';
import { SearchResultDto } from 'src/search/dto/search-result.dto';
import { Role } from '@prisma/client';
import { Roles } from '../iam/decorators/roles.decorator';

@Roles(Role.ADMIN, Role.OPERATOR)
@ApiTags('document')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConflictResponse({
    description: 'Document with same filename already exists',
  })
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: File,
    @ActiveUser() { sub: userId }: ActiveUserData,
  ): Promise<CreateDocumentResponseDto> {
    return this.documentService.create(createDocumentDto, file, userId);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Get('indexation-status/:id')
  getIndexationStatus(@Param('id') id: string): Promise<IndexationStatusDto> {
    return this.documentService.getIndexationStatus(id);
  }

  @Patch()
  update(
    @Body() updateDocumentDto: UpdateDocumentDto,
    @ActiveUser() { sub: userId }: ActiveUserData,
  ): Promise<SearchResultDto[]> {
    return this.documentService.update(updateDocumentDto, userId);
  }

  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  @Post('mark-as-favorite/:id')
  markAsFavorite(
    @Param('id') id: string,
    @ActiveUser() { sub: userId }: ActiveUserData,
  ) {
    return this.documentService.markAsFavorite(userId, id);
  }

  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  @Post('remove-from-favorites/:id')
  removeFromFavorites(
    @Param('id') id: string,
    @ActiveUser() { sub: userId }: ActiveUserData,
  ) {
    return this.documentService.removeFromFavorites(userId, id);
  }

  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  @Get('favorites-ids')
  getFavoriteDocumentIds(
    @ActiveUser() { sub: userId }: ActiveUserData,
  ): Promise<string[]> {
    return this.documentService.retrieveFavoritedDocumentIds(userId);
  }

  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  @Get('favorites')
  getFavoriteDocuments(
    @ActiveUser() { sub: userId }: ActiveUserData,
  ): Promise<SearchResultDto[]> {
    return this.documentService.retrieveFavoritedDocuments(userId);
  }

  @Roles(Role.ADMIN)
  @Delete()
  remove(@Body() { ids }: DeleteDocumentsDto) {
    return this.documentService.remove(ids);
  }
}
