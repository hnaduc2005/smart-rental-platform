# Database guide

Ngay cap nhat: 12/06/2026

Tai lieu nay tom tat database layer cho Smart Rental Platform: Prisma schema, migration, seed data va cach backend NestJS su dung Prisma.

## 1. Bang chinh

Nhom tai khoan va ho so:

- `User`
- `LandlordProfile`
- `TenantProfile`
- `AdminAuditLog`

Nhom nha tro va phong:

- `Property`
- `Room`
- `RoomImage`
- `Amenity`
- `RoomAmenity`
- `RoomType`
- `Region`

Nhom thue phong:

- `ViewingAppointment`
- `RentalRequest`
- `Contract`
- `CoTenant`

Nhom tai chinh:

- `Deposit`
- `Invoice`
- `InvoiceItem`
- `MeterReading`
- `Payment`
- `PaymentMethod`

Nhom van hanh va goi dich vu:

- `IssueReport`
- `Notification`
- `Review`
- `ServicePackage`
- `LandlordSubscription`

## 2. Enum chinh

- `Role`: `ADMIN`, `LANDLORD`, `SEEKER`, `TENANT`
- `UserStatus`: `PENDING`, `ACTIVE`, `LOCKED`, `SUSPENDED`, `DELETED`
- `VerificationStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `PropertyStatus`: `ACTIVE`, `HIDDEN`, `MAINTENANCE`, `DELETED`
- `RoomStatus`: `AVAILABLE`, `DEPOSITED`, `RENTED`, `MAINTENANCE`, `HIDDEN`
- `AppointmentStatus`: `REQUESTED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- `RentalRequestStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- `ContractStatus`: `DRAFT`, `ACTIVE`, `ENDED`, `TERMINATED`, `EXPIRED`
- `DepositStatus`: `NONE`, `PENDING_CONFIRMATION`, `PAID`, `REFUNDED`, `FORFEITED`, `REJECTED`
- `InvoiceStatus`: `UNPAID`, `PENDING_CONFIRMATION`, `PAID`, `OVERDUE`, `REJECTED`
- `PaymentStatus`: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`
- `IssueStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`
- `IssueType`: `ELECTRICITY`, `WATER`, `INTERNET`, `SANITATION`, `SECURITY`, `EQUIPMENT`, `OTHER`
- `MeterReadingType`: `ELECTRICITY`, `WATER`, `OTHER`
- `SubscriptionStatus`: `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED`
- `AdminAuditAction`: `APPROVE_LANDLORD`, `REJECT_LANDLORD`, `BAN_USER`, `UNBAN_USER`, `CHANGE_USER_ROLE`, `CREATE_SERVICE_PACKAGE`, `UPDATE_SERVICE_PACKAGE`, `DISABLE_SERVICE_PACKAGE`

## 3. Quan he quan trong

- `User` 1-1 `LandlordProfile`
- `User` 1-1 `TenantProfile`
- `LandlordProfile` 1-n `Property`
- `Property` 1-n `Room`
- `Room` 1-n `RoomImage`
- `Room` n-n `Amenity` thong qua `RoomAmenity`
- `Room` 1-n `ViewingAppointment`
- `Room` 1-n `RentalRequest`
- `RentalRequest` co the lien ket 1-1 toi `Contract` khi duoc duyet
- `Contract` lien ket `TenantProfile`, `LandlordProfile`, `Room`
- `Contract` 1-n `Invoice`
- `Invoice` 1-n `InvoiceItem`
- `Invoice` 1-n `Payment`
- `Contract` 1-n `CoTenant`
- `Room` va tuy chon `Contract` lien ket `IssueReport`
- `TenantProfile` co the review `Room` va `LandlordProfile`
- `LandlordProfile` 1-n `LandlordSubscription`
- `ServicePackage` 1-n `LandlordSubscription`
- `AdminAuditLog` lien ket voi admin trong `User`

## 4. Tai khoan seed

Seed script tao cac tai khoan test sau:

| Vai tro | Email | Mat khau | Trang thai |
| --- | --- | --- | --- |
| Admin | `admin@smart-rental.local` | `Admin@123456` | `ACTIVE` |
| Seeker | `seeker@smart-rental.local` | `User@123456` | `ACTIVE` |
| Tenant | `tenant@smart-rental.local` | `User@123456` | `ACTIVE` |
| Landlord pending | `landlord.pending@smart-rental.local` | `User@123456` | `PENDING` |
| Landlord approved | `landlord.approved@smart-rental.local` | `User@123456` | `ACTIVE` |

Mat khau duoc hash bang `bcryptjs` trong seed script. Khong luu plain text vao database.

## 5. Lenh migration va generate

Cai dependencies:

```bash
pnpm install
```

Format schema:

```bash
pnpm --filter @smart-rental/database prisma:format
```

Generate Prisma Client:

```bash
pnpm db:generate
```

Tao/chay migration dau tien tren database dev:

```bash
pnpm db:migrate -- --name init
```

Chay seed:

```bash
pnpm db:seed
```

Kiem tra TypeScript:

```bash
pnpm typecheck
```

Neu `pnpm` chua co trong PATH, co the dung dung phien ban khai bao trong `package.json`:

```bash
npx --yes pnpm@9.15.0 install
npx --yes pnpm@9.15.0 db:generate
npx --yes pnpm@9.15.0 db:migrate -- --name init
npx --yes pnpm@9.15.0 db:seed
```

## 6. Migration hien tai

Migration SQL offline da duoc tao tai:

```text
packages/database/prisma/migrations/20260612000000_init/migration.sql
```

File nay duoc tao bang `prisma migrate diff --from-empty --to-schema ... --script`, khong mutate database that. Khi dung database dev da xac nhan, nen chay `pnpm db:migrate -- --name init` de Prisma ghi nhan migration trong bang `_prisma_migrations`.

## 7. Luu y cho backend

Backend da co:

- `PrismaModule`
- `PrismaService`
- Import `PrismaModule` trong `AppModule`

Service backend nen inject `PrismaService` thay vi tu tao `new PrismaClient()`:

```ts
constructor(private readonly prisma: PrismaService) {}
```

Khong tao PrismaClient rieng le trong tung module, vi se lam tang so connection va kho quan ly shutdown.

## 8. Logic de service layer xu ly

Cac logic sau khong nen ep qua muc o DB:

- Moi phong toi thieu 3 anh.
- So nguoi o khong vuot qua `maxOccupants`.
- Chi tenant co hop dong hop le moi duoc review.
- Chu tro chi duoc thao tac phong thuoc property cua minh.
- Tinh tien dien, nuoc, phi dich vu va tong hoa don.
- Quy tac chuyen trang thai phong khi dat coc, ky hop dong, huy hop dong.
- Quy tac xac nhan/reject payment va deposit.
- Kiem tra goi dich vu co con han va con quota dang phong hay khong.

DB chi giu cac rang buoc nen tang: unique, foreign key, enum, Decimal cho tien te, DateTime cho moc thoi gian, status/isActive thay cho hard delete o cac bang quan trong.
