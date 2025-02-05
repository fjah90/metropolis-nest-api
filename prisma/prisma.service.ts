
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: any) {
    // No uses 'beforeExit'. En su lugar, usa el hook de cierre de NestJS.
    process.on('SIGTERM', async () => {
      await this.$disconnect(); // Desconecta Prisma
      await app.close(); // Cierra la aplicación
    });

    process.on('SIGINT', async () => {
      await this.$disconnect(); // Desconecta Prisma
      await app.close(); // Cierra la aplicación
    });
  }
}
