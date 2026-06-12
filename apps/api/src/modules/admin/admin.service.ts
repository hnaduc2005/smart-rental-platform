import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

@Injectable()
export class AdminService {
  getHealth() {
    return {
      status: "ok",
      module: "admin",
      message: "Admin API is protected"
    };
  }

  getCurrentAdmin(user: AuthenticatedUser) {
    return user;
  }
}
