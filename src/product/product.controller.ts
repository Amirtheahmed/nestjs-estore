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
    Post, Query,
    UseGuards
} from '@nestjs/common';
import {ProductService} from "./product.service";
import {CreateProductDto, EditProductDto, ProductOutputDto} from "./dto";
import {JwtGuard} from "../auth/guard";
import {PaginationParams} from "../utils/types";
import {ApiPaginatedResponse} from "../utils/decorators/api-paginated-response-decorator";
import {ApiOkResponse, ApiQuery, ApiTags} from "@nestjs/swagger";
import {PaginatedOutputDto} from "../utils/dto";

@ApiTags('Products')
@UseGuards(JwtGuard)
@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get()
    @ApiPaginatedResponse(ProductOutputDto)
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query to filter products' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    getProducts(
        @Query('search') search: string | null,
        @Query() { page, limit }: PaginationParams
    ): Promise<PaginatedOutputDto<ProductOutputDto>> {
        if (search) {
            return this.productService.searchProducts(search, page, limit);
        }
        return this.productService.getProducts(page, limit);
    }

    @Get(':id')
    @ApiOkResponse({ type: ProductOutputDto })
    getProductById(@Param('id', ParseIntPipe) productId: number) {
        return this.productService.getProductById(productId);
    }

    @Post()
    @ApiOkResponse({ type: ProductOutputDto })
    createProduct(@Body() dto: CreateProductDto) {
        return this.productService.createProduct(dto)
    }

    @Patch(':id')
    @ApiOkResponse({ type: ProductOutputDto })
    editProduct(@Param('id', ParseIntPipe) productId: number, @Body() dto: EditProductDto) {
        return this.productService.editProduct(productId, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiQuery({ name: 'deleteChildren', required: false, type: Boolean, description: 'Remove all child products when deleting a product' })
    @Delete(':id')
    deleteProduct(
        @Param('id', ParseIntPipe) productId: number,
    ) {
        return this.productService.deleteProduct(productId);
    }
}
