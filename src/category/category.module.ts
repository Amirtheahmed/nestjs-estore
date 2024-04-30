import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ ttl: 60 * 60 * 1000, max: 100 })],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
