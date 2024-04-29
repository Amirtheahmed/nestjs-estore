import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import {Product, Prisma} from '@prisma/client';

import {PrismaService} from "../prisma/prisma.service";
import {CreateProductDto, EditProductDto, ProductOutputDto} from "./dto";
import {plainToInstance} from "class-transformer";
import {PaginatedOutputDto} from "../utils/dto";
import {ProductWithCategory} from "./types";

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    async getProducts(page?: number, limit?: number): Promise<PaginatedOutputDto<ProductOutputDto>> {
        const paginate = createPaginator({ perPage: limit });

        const paginationResult = await paginate<ProductOutputDto, Prisma.ProductFindManyArgs>(
            this.prisma.product,
            {
                where: {},
                orderBy: { id: 'desc' }
            },
            { page }
        );

        const data = paginationResult.data.map(item => plainToInstance(ProductOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async searchProducts(search: string, page?: number, limit?: number): Promise<PaginatedOutputDto<ProductOutputDto>> {
        const paginate = createPaginator({ perPage: limit });

        const query = {
            where: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
        } satisfies Prisma.ProductFindManyArgs;

        const paginationResult = await paginate<ProductOutputDto, Prisma.ProductFindManyArgs>(
            this.prisma.product,
            {
                where: query.where,
                orderBy: {
                    id: 'desc',
                },
            },
            {
                page,
            },
        );

        const data = paginationResult.data.map(item => plainToInstance(ProductOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async createProduct(dto: CreateProductDto): Promise<ProductOutputDto> {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId }
        });

        if (!category) {
            throw new NotFoundException('Category not found.');
        }

        const product = await this.prisma.product.create({
            data: {
                ...dto
            },
            include: {
                category: true
            }
        });

        return plainToInstance(ProductOutputDto, product, { excludeExtraneousValues: true });
    }

    async getProductById(productId: number): Promise<ProductOutputDto> {
        const product = await this.prisma.product.findUnique({
            where: {
                id: productId
            },
            include: {
                category: true
            }
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        return plainToInstance(ProductOutputDto, product, {
            excludeExtraneousValues: true
        });
    }

    async editProduct(productId:number, dto: EditProductDto): Promise<ProductOutputDto> {

        if(dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId }
            });

            if (!category) {
                throw new NotFoundException('Category not found.');
            }
        }

        let product = this.prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        const updated = await this.prisma.product.update({
            where: {
                id: productId
            },
            data: {
                ...dto
            }
        });

        return plainToInstance(ProductOutputDto, updated, { excludeExtraneousValues: true });
    }

    async deleteProduct(productId: number): Promise<void> {
        let product = this.prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        await this.prisma.product.delete({
            where: {
                id: productId
            }
        })
    }
}
