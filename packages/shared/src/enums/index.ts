export const USER_ROLES = ["ADMIN", "LANDLORD", "SEEKER", "TENANT"] as const;

export type UserRole = (typeof USER_ROLES)[number];
