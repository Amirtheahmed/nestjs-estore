import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
    let left = 1;

    for (let i = 0; i < 10; i++) {
        const name = faker.commerce.department();
        const description = faker.commerce.productDescription();
        const parentLeft = left;
        left++;  // Increment to account for the parent's left

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

        // Now we know the right value for the parent category
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

seedCategories()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
