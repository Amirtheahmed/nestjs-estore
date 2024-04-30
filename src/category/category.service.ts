import {
    BadRequestException, Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import {Category, Prisma} from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import {PrismaService} from "../prisma/prisma.service";
import {CreateCategoryDto, EditCategoryDto, CategoryOutputDto} from "./dto";
import {plainToInstance} from "class-transformer";
import {PaginatedOutputDto} from "../utils/dto";
import {CategoryWithParent} from "./types";
import { GET_CATEGORIES_CACHE_KEY } from '../utils/constants';

@Injectable()
export class CategoryService {
    constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private prisma: PrismaService,
    ) {}

    async clearCache() {
        const keys: string[] = await this.cacheManager.store.keys();
        keys.forEach((key) => {
            if (key.startsWith(GET_CATEGORIES_CACHE_KEY)) {
                this.cacheManager.del(key);
            }
        })
    }

    async getCategories(page?: number, limit?: number): Promise<PaginatedOutputDto<CategoryOutputDto>> {
        const paginate = createPaginator({ perPage: limit });

        const paginationResult = await paginate<CategoryOutputDto, Prisma.CategoryFindManyArgs>(
            this.prisma.category,
            {
                where: {},
                orderBy: { id: 'desc' }
            },
            { page }
        );

        const data = paginationResult.data.map(item => plainToInstance(CategoryOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async searchCategories(search: string, page?: number, limit?: number): Promise<PaginatedOutputDto<CategoryOutputDto>> {
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
        } satisfies Prisma.CategoryFindManyArgs;

        const paginationResult = await paginate<CategoryOutputDto, Prisma.CategoryFindManyArgs>(
            this.prisma.category,
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

        const data = paginationResult.data.map(item => plainToInstance(CategoryOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async getChildCategories(parentId: number, page?: number, limit?: number): Promise<PaginatedOutputDto<CategoryOutputDto>> {
        const paginate = createPaginator({ perPage: limit });

        const parent = await this.prisma.category.findUnique({
            where: { id: parentId },
            select: { lft: true, rgt: true }
        });

        if (!parent) {
            throw new NotFoundException('Parent category not found.');
        }

        // Calculate the potential 'lft' values that immediate children would have
        const potentialImmediateChildren = await this.prisma.category.findMany({
            where: {
                lft: {
                    gt: parent.lft,
                    lt: parent.rgt
                }
            },
            orderBy: {
                lft: 'asc'
            },
            select: {
                lft: true,
                rgt: true
            }
        });

        // Filter to get only immediate children
        const immediateChildren = potentialImmediateChildren.filter((child, index, array) => {
            // An immediate child has no other categories nested under it within this parent
            if (index === 0) return true; // The first child is always immediate
            return child.lft > array[index - 1].rgt;
        });

        // Use the filtered 'lft' values to get the full data
        const childCategoryIds = immediateChildren.map(child => child.lft);
        const paginationResult = await paginate<CategoryOutputDto, Prisma.CategoryFindManyArgs>(
            this.prisma.category,
            {
                where: {
                    lft: { in: childCategoryIds }
                },
                orderBy: {
                    id: 'desc',
                },
            },
            {
                page,
            }
        );

        const data = paginationResult.data.map(item => plainToInstance(CategoryOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async searchChildCategories(parentId: number, search: string, page?: number, limit?: number): Promise<PaginatedOutputDto<CategoryOutputDto>> {
        const paginate = createPaginator({ perPage: limit });

        const parent = await this.prisma.category.findUnique({
            where: { id: parentId },
            select: { lft: true, rgt: true }
        });

        if (!parent) {
            throw new NotFoundException('Parent category not found.');
        }

        // First, get all potential immediate children based on lft and rgt
        const potentialImmediateChildren = await this.prisma.category.findMany({
            where: {
                lft: { gt: parent.lft, lt: parent.rgt },
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            },
            orderBy: { lft: 'asc' },
            select: { id: true, lft: true, rgt: true }
        });

        // Filter to find only immediate children
        const immediateChildrenIds = potentialImmediateChildren.filter((child, index, array) => {
            // An immediate child should not have any other categories nested under it
            if (index === 0) return true; // The first child is always immediate
            return child.lft > array[index - 1].rgt;
        }).map(child => child.id);

        // Fetch full data for immediate children
        const paginationResult = await paginate<CategoryOutputDto, Prisma.CategoryFindManyArgs>(
            this.prisma.category,
            {
                where: {
                    id: { in: immediateChildrenIds }
                },
                orderBy: {
                    id: 'desc',
                },
            },
            { page }
        );

        const data = paginationResult.data.map(item => plainToInstance(CategoryOutputDto, item, { excludeExtraneousValues: true }));

        return {
            ...paginationResult,
            data
        };
    }

    async getParentCategory(subCategoryId: number): Promise<CategoryOutputDto> {
        const subCategory = await this.prisma.category.findUnique({
            where: { id: subCategoryId },
            select: { lft: true, rgt: true }
        });

        if (!subCategory) {
            throw new NotFoundException(`Subcategory with ID ${subCategoryId} not found.`);
        }

        const parentCategory = await this.prisma.category.findFirst({
            where: {
                lft: { lt: subCategory.lft },
                rgt: { gt: subCategory.rgt }
            },
            orderBy: { lft: 'desc' }
        });

        if (!parentCategory) {
            throw new NotFoundException(`Parent category for subcategory ID ${subCategoryId} not found.`);
        }

        return plainToInstance(CategoryOutputDto, parentCategory, { excludeExtraneousValues: true });
    }

    async createCategory(dto: CreateCategoryDto): Promise<CategoryOutputDto> {
        let newCategory: Category;

        await this.prisma.$transaction(async (prisma) => {
            if (dto.parentId) {
                const parent = await prisma.category.findUnique({
                    where: { id: dto.parentId },
                    select: { lft: true, rgt: true }
                });

                if (!parent) {
                    throw new NotFoundException('Parent category not found.');
                }

                const { rgt } = parent;

                // Update surrounding categories to accommodate new child
                await prisma.category.updateMany({
                    where: { rgt: { gte: rgt } },
                    data: { rgt: { increment: 2 } }
                });
                await prisma.category.updateMany({
                    where: { lft: { gt: rgt } },
                    data: { lft: { increment: 2 } }
                });

                // Create the child category
                newCategory = await prisma.category.create({
                    data: {
                        name: dto.name,
                        description: dto.description,
                        lft: rgt,
                        rgt: rgt + 1
                    }
                });
            } else {
                // Handle root category creation
                const maxRgt = await prisma.category.aggregate({
                    _max: { rgt: true }
                });
                const maxRgtValue = maxRgt._max.rgt ?? 0;

                newCategory = await prisma.category.create({
                    data: {
                        name: dto.name,
                        description: dto.description,
                        lft: maxRgtValue + 1,
                        rgt: maxRgtValue + 2
                    }
                });
            }
            await this.clearCache();
        });
        return plainToInstance(CategoryOutputDto, newCategory, { excludeExtraneousValues: true });
    }

    async getCategoryById(categoryId: number): Promise<CategoryOutputDto> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        }) as CategoryWithParent;

        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found.`);
        }

        const parentCategory = await this.prisma.category.findFirst({
            where: {
                lft: { lt: category.lft },
                rgt: { gt: category.rgt }
            },
            orderBy: { lft: 'desc' }
        });

        if (parentCategory) {
            category.parent = parentCategory;
        }

        return plainToInstance(CategoryOutputDto, category, {
            excludeExtraneousValues: true
        });
    }

    async editCategory(categoryId:number, dto: EditCategoryDto): Promise<CategoryOutputDto> {
        let category = await this.prisma.category.findUnique({
            where: {
                id: categoryId
            }
        });

        if(!category) {
            throw new NotFoundException('Category not found');
        }

        category = await this.prisma.category.update({
            where: {
                id: categoryId
            },
            data: {
                ...dto
            }
        });

        await this.clearCache();

        return plainToInstance(CategoryOutputDto, category, { excludeExtraneousValues: true });
    }

    async deleteCategory(categoryId: number, deleteSubcategories: boolean = false): Promise<void> {
        // Start a transaction for data consistency
        await this.prisma.$transaction(async (prisma) => {
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
                select: { lft: true, rgt: true }
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }

            const lft = category.lft;
            const rgt = category.rgt;
            const width = rgt - lft + 1;

            // Check if the category has subcategories
            const hasSubcategories = await prisma.category.count({
                where: {
                    AND: [
                        { lft: { gt: lft } },
                        { rgt: { lt: rgt } }
                    ]
                }
            }) > 0;

            if (hasSubcategories && !deleteSubcategories) {
                throw new BadRequestException('Category has subcategories and cannot be deleted without deleting them.');
            }

            if (hasSubcategories && deleteSubcategories) {
                // Delete the category and all its subcategories
                await prisma.category.deleteMany({
                    where: {
                        lft: { gte: lft },
                        rgt: { lte: rgt }
                    }
                });
            } else {
                // Delete only the category if it has no subcategories
                await prisma.category.delete({
                    where: { id: categoryId }
                });
            }

            // Update lft and rgt values for all categories after the deleted ones
            await prisma.category.updateMany({
                where: {
                    lft: { gt: rgt }
                },
                data: {
                    lft: { decrement: width }
                }
            });

            await prisma.category.updateMany({
                where: {
                    rgt: { gt: rgt }
                },
                data: {
                    rgt: { decrement: width }
                }
            });

            await this.clearCache();
        });
    }
}
