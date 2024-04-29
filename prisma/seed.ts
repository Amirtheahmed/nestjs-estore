import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { RoleSlug } from "../src/utils/constants";

const argon2 = require('argon2');
const prisma = new PrismaClient();

async function seedUsersWithRoles() {
    // Create admin user
    // await prisma.user.create({
    //     data: {
    //         email: 'admin@example.com',
    //         hash: await argon2.hash('admin123'),
    //         firstName: 'Admin',
    //         lastName: 'User',
    //         role: RoleSlug.ADMIN,
    //     },
    // });

    // Create admin user
    await prisma.user.create({
        data: {
            email: 'user@example.com',
            hash: await argon2.hash('user123'),
            firstName: 'Regular',
            lastName: 'User',
            role: RoleSlug.USER,
        },
    });
}

async function seedCategories() {
    let left = 1;

    for (let i = 0; i < 10; i++) {
        const name = faker.commerce.department();
        const description = faker.commerce.productDescription();

        const parentLeft = left;
        left++;  // Move past the left of the parent

        for (let j = 0; j < 100; j++) {
            // Create sub-categories
            await prisma.category.create({
                data: {
                    name: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    lft: left,
                    rgt: left + 1
                }
            });
            left += 2;  // Move past the right of the sub-category
        }

        const parentRight = left;  // Parent encompasses all sub-categories

        await prisma.category.create({
            data: {
                name,
                description,
                lft: parentLeft,
                rgt: parentRight
            }
        });

        left++;  // Prepare for the next top-level category
    }
}

async function seedProducts() {
    const categories = await prisma.category.findMany();

    for (const category of categories) {
        for (let i = 0; i < 10; i++) {
            await prisma.product.create({
                data: {
                    name: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    price: faker.number.int({ min: 1000, max: 10000 }),
                    categoryId: category.id,
                    stockQuantity: faker.number.int({ min: 10, max: 100 }),
                    isActive: faker.datatype.boolean(),
                }
            });
        }
    }
}

async function main() {
    try {
        await seedUsersWithRoles();
        await seedCategories();
        await seedProducts();
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();