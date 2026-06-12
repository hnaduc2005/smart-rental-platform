import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@smart-rental/database";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private shutdownHooksEnabled = false;

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutdownHooks(app: INestApplication) {
    if (this.shutdownHooksEnabled) {
      return;
    }

    this.shutdownHooksEnabled = true;
    process.once("beforeExit", () => {
      void app.close();
    });
  }
}
