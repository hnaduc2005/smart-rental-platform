import { Module } from "@nestjs/common";
import { CoTenantsController } from "./co-tenants.controller";
import { CoTenantsService } from "./co-tenants.service";

@Module({
  controllers: [CoTenantsController],
  providers: [CoTenantsService],
  exports: [CoTenantsService]
})
export class CoTenantsModule {}
