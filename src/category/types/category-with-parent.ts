import {Category} from "@prisma/client";

export interface CategoryWithParent extends Category {
    parent?: Category;
}