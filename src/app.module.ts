import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module';
import {UserModule} from "./user/user.module";
import { CategoryModule } from './category/category.module';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UserModule, PrismaModule, CategoryModule, ProductModule],
})
export class AppModule {}
