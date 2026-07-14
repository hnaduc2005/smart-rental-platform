import { Module } from "@nestjs/common";
import { AdminModule } from "./modules/admin/admin.module";
import { AmenitiesModule } from "./modules/amenities/amenities.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CoTenantsModule } from "./modules/co-tenants/co-tenants.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { DepositsModule } from "./modules/deposits/deposits.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { IssuesModule } from "./modules/issues/issues.module";
import { LandlordsModule } from "./modules/landlords/landlords.module";
import { MeterReadingsModule } from "./modules/meter-readings/meter-readings.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { RegionsModule } from "./modules/regions/regions.module";
import { RentalRequestsModule } from "./modules/rental-requests/rental-requests.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { RolesModule } from "./modules/roles/roles.module";
import { RoomImagesModule } from "./modules/room-images/room-images.module";
import { RoomTypesModule } from "./modules/room-types/room-types.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { ServicePackagesModule } from "./modules/service-packages/service-packages.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";
import { ViewingAppointmentsModule } from "./modules/viewing-appointments/viewing-appointments.module";

import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST || "smtp.gmail.com",
          port: Number(process.env.MAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.MAIL_USER || "",
            pass: process.env.MAIL_PASS || ""
          },
          tls: { rejectUnauthorized: false }
        },
        defaults: {
          from: `"Smart Rental" <${process.env.MAIL_USER || "no-reply@smartrental.com"}>`
        }
      })
    }),
    PrismaModule,
    AdminModule,
    AmenitiesModule,
    AuthModule,
    CoTenantsModule,
    ContractsModule,
    DepositsModule,
    InvoicesModule,
    IssuesModule,
    LandlordsModule,
    MeterReadingsModule,
    NotificationsModule,
    PaymentsModule,
    PropertiesModule,
    RegionsModule,
    RentalRequestsModule,
    ReportsModule,
    ReviewsModule,
    RolesModule,
    RoomImagesModule,
    RoomTypesModule,
    RoomsModule,
    ServicePackagesModule,
    SubscriptionsModule,
    TenantsModule,
    UploadsModule,
    UsersModule,
    ViewingAppointmentsModule
  ]
})
export class AppModule {}
