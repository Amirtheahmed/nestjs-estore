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
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ ttl: 60 * 1000, max: 100}), // 1 minutes
    ThrottlerModule.forRoot([
      {
        name: '3-per-second',
        ttl: 1000,
        limit: 3,
      },
      {
        name: '20-per-10-seconds',
        ttl: 10000,
        limit: 20
      },
      {
        name: '100-per-minute',
        ttl: 60000,
        limit: 100
      }
    ]),
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
