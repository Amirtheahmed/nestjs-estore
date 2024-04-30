import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module';
import {UserModule} from "./user/user.module";
import { CategoryModule } from './category/category.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductModule } from './product/product.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpCacheInterceptor } from './utils/interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ ttl: 60 * 1000, max: 100}), // 1 minutes
    AuthModule,
    UserModule,
    PrismaModule,
    CategoryModule,
    ProductModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    }
  ]
})
export class AppModule {}
