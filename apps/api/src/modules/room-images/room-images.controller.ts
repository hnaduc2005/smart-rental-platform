import { Controller } from "@nestjs/common";
import { RoomImagesService } from "./room-images.service";

@Controller("room-images")
export class RoomImagesController {
  constructor(private readonly roomImagesService: RoomImagesService) {}
}
