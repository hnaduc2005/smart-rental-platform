import {
  Prisma,
  PropertyStatus,
  Role,
  RoomStatus,
  UserStatus,
  VerificationStatus
} from "@smart-rental/database";

export const publicLandlordWhere = {
  verificationStatus: VerificationStatus.APPROVED,
  user: {
    is: {
      role: Role.LANDLORD,
      status: UserStatus.ACTIVE,
      deletedAt: null
    }
  }
} satisfies Prisma.LandlordProfileWhereInput;

export const publicPropertyWhere = {
  status: PropertyStatus.ACTIVE,
  landlord: {
    is: publicLandlordWhere
  }
} satisfies Prisma.PropertyWhereInput;

export const publicRoomWhere = {
  status: RoomStatus.AVAILABLE,
  property: {
    is: publicPropertyWhere
  }
} satisfies Prisma.RoomWhereInput;
