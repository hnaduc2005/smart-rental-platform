import { Module } from "@nestjs/common";
import { RoomImagesController } from "./room-images.controller";
import { RoomImagesService } from "./room-images.service";

@Module({
  controllers: [RoomImagesController],
  providers: [RoomImagesService],
  exports: [RoomImagesService]
})
export class RoomImagesModule {}
