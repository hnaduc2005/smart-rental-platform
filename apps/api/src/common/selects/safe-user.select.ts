import { Prisma } from "@smart-rental/database";

export const safeUserSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  status: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  avatarUrl: true
} satisfies Prisma.UserSelect;
