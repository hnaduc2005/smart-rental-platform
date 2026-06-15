import { Role, UserStatus } from "@smart-rental/database";

export type AuthenticatedUser = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  role: Role;
  status: UserStatus;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string | string[];
  };
  user?: AuthenticatedUser;
};
