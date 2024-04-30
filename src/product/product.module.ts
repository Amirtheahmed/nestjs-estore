import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ ttl: 60 * 60 * 1000, max: 100 })],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
