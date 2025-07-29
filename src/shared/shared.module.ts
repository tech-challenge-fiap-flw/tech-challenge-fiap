import { Module } from "@nestjs/common";
import { BaseService } from "./domain/services/base-service.service";

@Module({
  providers: [BaseService],
  exports: [BaseService],
})
export class SharedModule {}