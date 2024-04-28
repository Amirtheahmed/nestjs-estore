-- CreateIndex
CREATE INDEX "cat_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "cat_description_idx" ON "categories"("description");

-- CreateIndex
CREATE INDEX "cat_nested_description_idx" ON "categories"("lft", "rgt", "description");

-- CreateIndex
CREATE INDEX "cat_nested_name_idx" ON "categories"("lft", "rgt", "name");
