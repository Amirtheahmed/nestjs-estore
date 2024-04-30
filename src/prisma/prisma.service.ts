import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDB() {
    // used transaction to make sure the right order of query execution and avoid prisma's optimization reordering
    return this.$transaction([
      this.user.deleteMany(),
      this.product.deleteMany(),
      this.category.deleteMany(),
    ]);
  }
}
