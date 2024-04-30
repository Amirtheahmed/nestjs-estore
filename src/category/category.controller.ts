import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, EditCategoryDto, CategoryOutputDto } from './dto';
import { JwtGuard, RoleGuard } from '../auth/guard';
import { PaginationParams } from '../utils/types';
import { ApiPaginatedResponse } from '../utils/decorators/api-paginated-response-decorator';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedOutputDto } from '../utils/dto';
import { Roles } from '../auth/decorators';
import {
  GET_CATEGORIES_CACHE_KEY,
  GET_CHILD_CATEGORIES_CACHE_KEY,
  RoleSlug,
} from '../utils/constants';
import { CacheKey } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Categories')
@UseGuards(JwtGuard, RoleGuard, ThrottlerGuard)
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @Roles(RoleSlug.ADMIN, RoleSlug.USER)
  @CacheKey(GET_CATEGORIES_CACHE_KEY)
  @ApiPaginatedResponse(CategoryOutputDto)
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query to filter categories',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  getCategories(
    @Query('search') search: string | null,
    @Query() { page, limit }: PaginationParams,
  ): Promise<PaginatedOutputDto<CategoryOutputDto>> {
    if (search) {
      return this.categoryService.searchCategories(search, page, limit);
    }
    return this.categoryService.getCategories(page, limit);
  }

  @Get(':id/child')
  @Roles(RoleSlug.ADMIN, RoleSlug.USER)
  @CacheKey(GET_CHILD_CATEGORIES_CACHE_KEY)
  @ApiPaginatedResponse(CategoryOutputDto)
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query to filter categories',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  getChildCategories(
    @Query('search') search: string | null,
    @Query() { page, limit }: PaginationParams,
    @Param('id', ParseIntPipe) parentId: number,
  ) {
    if (search) {
      return this.categoryService.searchChildCategories(
        parentId,
        search,
        page,
        limit,
      );
    }

    return this.categoryService.getChildCategories(parentId, page, limit);
  }

  @Get(':id')
  @Roles(RoleSlug.ADMIN, RoleSlug.USER)
  @ApiOkResponse({ type: CategoryOutputDto })
  getCategoryById(@Param('id', ParseIntPipe) categoryId: number) {
    return this.categoryService.getCategoryById(categoryId);
  }

  @Post()
  @Roles(RoleSlug.ADMIN)
  @ApiOkResponse({ type: CategoryOutputDto })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.ADMIN)
  @ApiOkResponse({ type: CategoryOutputDto })
  editCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ) {
    return this.categoryService.editCategory(categoryId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleSlug.ADMIN)
  @ApiQuery({
    name: 'deleteChildren',
    required: false,
    type: Boolean,
    description: 'Remove all child categories when deleting a category',
  })
  @Delete(':id')
  deleteCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query('deleteChildren') deleteChildren: boolean | null = false,
  ) {
    return this.categoryService.deleteCategory(categoryId, deleteChildren);
  }
}
