# Nền Tảng Quản Lý Phòng Trọ Thông Minh

Đây là skeleton ban đầu cho hệ thống quản lý phòng trọ thông minh dành cho
quản trị viên, chủ trọ, người tìm trọ và người thuê trọ.

Dự án được tổ chức theo kiến trúc monorepo để dễ mở rộng frontend, backend,
database schema và các package dùng chung trong quá trình phát triển lâu dài.

## Trạng Thái Hiện Tại

Repository hiện chỉ là bộ khung khởi tạo.

- Chưa có giao diện hoàn chỉnh.
- Chưa có business logic backend.
- Chưa có API endpoint xử lý nghiệp vụ thật.
- Chưa có dữ liệu mẫu hoặc seed data.
- Chưa có migration đã chạy lên database.
- Prisma schema mới ở mức thiết kế dữ liệu ban đầu.

Mục tiêu của giai đoạn này là tạo nền tảng cấu trúc rõ ràng, nhất quán và đủ
sẵn sàng để cài dependencies, kết nối Neon PostgreSQL, phát triển tính năng và
chạy migration sau này.

## Công Nghệ Sử Dụng

- Frontend: Next.js App Router
- Backend: NestJS
- ORM: Prisma
- Database: PostgreSQL
- Database hosting: Neon
- Monorepo: pnpm workspace
- Ngôn ngữ chính: TypeScript

## Vai Trò Trong Hệ Thống

Hệ thống được thiết kế cho các nhóm người dùng chính:

- Admin: quản trị hệ thống, duyệt tài khoản chủ trọ, quản lý danh mục và báo cáo.
- Chủ trọ / Landlord: quản lý nhà trọ, phòng trọ, người thuê, hợp đồng, hóa đơn và thanh toán.
- Người tìm trọ / Seeker: tìm kiếm phòng, xem chi tiết phòng, đặt lịch xem phòng và gửi yêu cầu thuê.
- Người thuê trọ / Tenant: xem thông tin phòng đang thuê, hóa đơn, thanh toán, phản ánh sự cố và đánh giá.

## Cấu Trúc Thư Mục

```text
apps/
  web/
    app/                    Next.js App Router routes
    components/             Components dùng cho frontend
    hooks/                  React hooks dùng chung trong frontend
    lib/                    Tiện ích phía frontend
    services/               Adapter gọi API hoặc service phía client
    types/                  Type riêng của frontend

  api/
    src/
      app.module.ts         Root module của NestJS
      main.ts               Entry point backend
      modules/              Các module nghiệp vụ dạng skeleton

packages/
  database/
    prisma/
      schema.prisma         Prisma schema ban đầu
    generated/              Prisma Client sẽ được generate vào đây

  shared/
    src/
      constants/            Hằng số dùng chung
      enums/                Enum/type dùng chung
      types/                Type dùng chung

docs/                       Tài liệu dự án

.env.example                Mẫu biến môi trường
package.json                Script monorepo cấp root
pnpm-workspace.yaml         Cấu hình pnpm workspace
tsconfig.base.json          TypeScript config dùng chung
```

## Ứng Dụng Frontend

Frontend nằm tại:

```text
apps/web
```

Các route đang được scaffold bằng Next.js App Router. Mỗi page hiện chỉ là
placeholder đơn giản để thể hiện cấu trúc điều hướng, chưa dựng UI chi tiết.

### Route Xác Thực

```text
apps/web/app/auth/login/page.tsx
apps/web/app/auth/register/page.tsx
apps/web/app/auth/forgot-password/page.tsx
```

Các route này dành cho đăng nhập, đăng ký và quên mật khẩu.

### Route Phòng Trọ Công Khai

```text
apps/web/app/rooms/page.tsx
apps/web/app/rooms/[id]/page.tsx
```

Các route này dành cho danh sách phòng trọ và trang chi tiết phòng.

### Không Gian Chủ Trọ

```text
apps/web/app/landlord/dashboard/page.tsx
apps/web/app/landlord/properties/page.tsx
apps/web/app/landlord/rooms/page.tsx
apps/web/app/landlord/tenants/page.tsx
apps/web/app/landlord/contracts/page.tsx
apps/web/app/landlord/deposits/page.tsx
apps/web/app/landlord/invoices/page.tsx
apps/web/app/landlord/payments/page.tsx
apps/web/app/landlord/reports/page.tsx
```

Khu vực này dành cho chủ trọ quản lý nhà trọ, phòng, người thuê, hợp đồng,
đặt cọc, hóa đơn, thanh toán và báo cáo.

### Không Gian Người Thuê

```text
apps/web/app/tenant/dashboard/page.tsx
apps/web/app/tenant/my-room/page.tsx
apps/web/app/tenant/invoices/page.tsx
apps/web/app/tenant/payments/page.tsx
apps/web/app/tenant/issues/page.tsx
apps/web/app/tenant/reviews/page.tsx
```

Khu vực này dành cho người thuê xem phòng đang thuê, hóa đơn, thanh toán,
gửi phản ánh sự cố và đánh giá phòng trọ.

### Không Gian Admin

```text
apps/web/app/admin/dashboard/page.tsx
apps/web/app/admin/users/page.tsx
apps/web/app/admin/landlords/page.tsx
apps/web/app/admin/room-posts/page.tsx
apps/web/app/admin/categories/page.tsx
apps/web/app/admin/service-packages/page.tsx
apps/web/app/admin/reports/page.tsx
```

Khu vực này dành cho admin quản lý người dùng, chủ trọ, tin đăng, danh mục,
gói dịch vụ và báo cáo tổng quan hệ thống.

### Component Và Layer Phụ Trợ

```text
apps/web/components/common
apps/web/components/layout
apps/web/components/forms
apps/web/components/tables
apps/web/lib
apps/web/hooks
apps/web/services
apps/web/types
```

Các thư mục này mới là khung ban đầu. Khi phát triển thật, nên tách component
theo domain hoặc theo pattern đã thống nhất trong frontend.

## Ứng Dụng Backend

Backend nằm tại:

```text
apps/api
```

Ứng dụng backend dùng NestJS. Mỗi domain chính được scaffold thành một module
riêng gồm:

```text
module.ts
controller.ts
service.ts
dto/
entities/
```

Các controller và service hiện chỉ là class rỗng theo chuẩn NestJS, chưa có
endpoint hoặc logic nghiệp vụ.

### Danh Sách Module Backend

```text
admin
amenities
auth
co-tenants
contracts
deposits
invoices
issues
landlords
meter-readings
notifications
payments
properties
regions
rental-requests
reports
reviews
roles
room-images
room-types
rooms
service-packages
subscriptions
tenants
uploads
users
viewing-appointments
```

Các module này phản ánh các nhóm chức năng chính của hệ thống:

- Quản lý tài khoản và phân quyền.
- Tìm kiếm và xem phòng trọ.
- Quản lý nhà trọ, phòng trọ và hình ảnh phòng.
- Đặt lịch xem phòng và gửi yêu cầu thuê.
- Quản lý hợp đồng thuê phòng đã ký trực tiếp.
- Quản lý người thuê và người ở cùng.
- Quản lý đặt cọc.
- Quản lý hóa đơn hàng tháng.
- Quản lý thanh toán và minh chứng chuyển khoản.
- Quản lý phản ánh, sự cố và yêu cầu sửa chữa.
- Quản lý thông báo.
- Quản lý đánh giá phòng trọ và chủ trọ.
- Quản trị hệ thống.
- Quản lý gói dịch vụ cho chủ trọ.
- Thống kê và báo cáo.
- Upload file hoặc hình ảnh.

## Package Database

Prisma schema nằm tại:

```text
packages/database/prisma/schema.prisma
```

Prisma Client sau khi generate sẽ nằm tại:

```text
packages/database/generated/client
```

Package database chịu trách nhiệm:

- Lưu Prisma schema.
- Generate Prisma Client.
- Chạy migration.
- Mở Prisma Studio khi cần kiểm tra dữ liệu.

## Thiết Kế Prisma Schema Ban Đầu

Schema hiện có các model chính:

- `User`
- `LandlordProfile`
- `TenantProfile`
- `Property`
- `Room`
- `RoomImage`
- `Amenity`
- `RoomAmenity`
- `RoomType`
- `Region`
- `ViewingAppointment`
- `RentalRequest`
- `Contract`
- `CoTenant`
- `Deposit`
- `Invoice`
- `InvoiceItem`
- `MeterReading`
- `Payment`
- `IssueReport`
- `Notification`
- `Review`
- `ServicePackage`
- `LandlordSubscription`
- `PaymentMethod`

Schema cũng có các enum nền tảng:

- `Role`
- `UserStatus`
- `RoomStatus`
- `AppointmentStatus`
- `RentalRequestStatus`
- `ContractStatus`
- `DepositStatus`
- `InvoiceStatus`
- `PaymentStatus`
- `IssueStatus`
- `IssueType`
- `SubscriptionStatus`

### Một Số Quan Hệ Chính

- `User` có thể có `LandlordProfile` hoặc `TenantProfile`.
- `Property` thuộc về `LandlordProfile`.
- `Room` thuộc về `Property`.
- `Room` có nhiều `RoomImage`.
- `Room` liên kết nhiều `Amenity` thông qua `RoomAmenity`.
- `ViewingAppointment` gắn với `Room` và người tìm trọ.
- `RentalRequest` gắn với `Room` và người gửi yêu cầu thuê.
- `Contract` gắn với `Room`, `TenantProfile` và `LandlordProfile`.
- `Invoice` gắn với `Contract`.
- `Payment` gắn với `Invoice`.
- `Deposit` có thể gắn với `RentalRequest` hoặc `Contract`.
- `IssueReport` do tenant tạo và liên quan đến `Room` hoặc `Contract`.
- `Review` do tenant tạo, liên quan đến `Room`, `LandlordProfile` và có thể gắn với `Contract`.
- `LandlordSubscription` liên kết `LandlordProfile` với `ServicePackage`.

### Ghi Chú Về Ràng Buộc Nghiệp Vụ

Một số ràng buộc nghiệp vụ chưa nên hard-code trong schema ở giai đoạn
skeleton:

- Mỗi phòng tối thiểu 3 ảnh.
- Số người ở không vượt quá `maxOccupants`.
- Chỉ tenant đủ điều kiện mới được đánh giá.
- Chủ trọ chỉ xác nhận thanh toán cho phòng thuộc quyền quản lý.
- Logic tính tiền điện, nước, phí dịch vụ và tổng hóa đơn.

Những phần này nên được xử lý ở service layer khi triển khai business logic.

Riêng yêu cầu mỗi phòng tại một thời điểm chỉ nên có một hợp đồng active được
chuẩn bị bằng trường `activeRoomId` nullable unique trong model `Contract`.
Khi triển khai logic thật, service sẽ chỉ gán `activeRoomId` cho hợp đồng đang
active của phòng.

## Package Shared

Package dùng chung nằm tại:

```text
packages/shared
```

Hiện package này mới chứa các hằng số, enum và type nền tảng. Về sau có thể
dùng để chia sẻ:

- Role và permission constants.
- API response types.
- DTO type dùng chung giữa frontend và backend nếu phù hợp.
- Các enum domain không phụ thuộc trực tiếp Prisma.
- Utility type dùng chung.

## Biến Môi Trường

File mẫu nằm tại:

```text
.env.example
```

Nội dung hiện tại:

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
UPLOAD_DIR=
```

Ý nghĩa:

- `DATABASE_URL`: connection string PostgreSQL dùng cho runtime, thường là pooled connection của Neon.
- `DIRECT_URL`: direct connection string dùng cho Prisma migration.
- `JWT_SECRET`: khóa ký token xác thực, sẽ dùng khi triển khai auth.
- `NEXT_PUBLIC_API_URL`: URL backend để frontend gọi API.
- `UPLOAD_DIR`: thư mục lưu file upload khi triển khai upload local hoặc adapter lưu trữ.

Không commit file `.env` thật lên repository.

## Cấu Hình Neon PostgreSQL

Các bước cấu hình Neon sau này:

1. Tạo project mới trên Neon.
2. Tạo database PostgreSQL cho dự án.
3. Lấy pooled connection string và gán vào `DATABASE_URL`.
4. Lấy direct connection string và gán vào `DIRECT_URL`.
5. Sao chép `.env.example` thành `.env`.
6. Điền đầy đủ các biến môi trường.
7. Chạy Prisma generate.
8. Chạy migration đầu tiên khi schema đã được duyệt.

Ví dụ dạng connection string:

```env
DATABASE_URL="postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require"
```

Không dùng giá trị ví dụ trên cho môi trường thật.

## Cài Đặt Dependencies

Dự án dùng `pnpm`. Sau khi máy có `pnpm`, chạy:

```bash
pnpm install
```

Nếu máy chưa có `pnpm`, có thể bật qua Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

Sau đó cài lại dependencies:

```bash
pnpm install
```

## Script Cấp Root

Các script chính trong `package.json` cấp root:

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Ý nghĩa:

- `pnpm dev`: chạy các app có script `dev`.
- `pnpm build`: build các package/app có script `build`.
- `pnpm typecheck`: kiểm tra TypeScript.
- `pnpm db:generate`: generate Prisma Client.
- `pnpm db:migrate`: chạy Prisma migrate dev.
- `pnpm db:studio`: mở Prisma Studio.

## Chạy Frontend

Sau khi cài dependencies:

```bash
pnpm --filter @smart-rental/web dev
```

Mặc định Next.js sẽ chạy ở:

```text
http://localhost:3000
```

Frontend hiện chỉ hiển thị các page placeholder.

## Chạy Backend

Sau khi cài dependencies:

```bash
pnpm --filter @smart-rental/api dev
```

Backend mặc định lắng nghe ở port `3001` nếu không cấu hình `PORT`.
Global prefix hiện là:

```text
/api
```

Backend hiện chưa có endpoint nghiệp vụ thật.

## Làm Việc Với Prisma

Generate Prisma Client:

```bash
pnpm db:generate
```

Format Prisma schema:

```bash
pnpm --filter @smart-rental/database prisma:format
```

Chạy migration đầu tiên:

```bash
pnpm --filter @smart-rental/database prisma:migrate:dev -- --name init
```

Mở Prisma Studio:

```bash
pnpm db:studio
```

Nên chạy migration sau khi:

- Đã cấu hình đúng `DATABASE_URL`.
- Đã cấu hình đúng `DIRECT_URL`.
- Đã review schema.
- Đã thống nhất naming convention cho các model quan trọng.

## Quy Ước Phát Triển Đề Xuất

- Giữ module backend theo domain, tránh dồn logic vào một service lớn.
- DTO đặt trong `dto/`.
- Entity hoặc type riêng của module đặt trong `entities/` hoặc `types/`.
- Không hard-code dữ liệu mẫu trong source code.
- Không đưa business logic vào controller.
- Controller chỉ nhận request, validate, gọi service và trả response.
- Service chịu trách nhiệm điều phối nghiệp vụ.
- Database access nên đi qua provider/service riêng khi triển khai Prisma trong NestJS.
- Frontend nên tách component dùng chung và component theo domain.
- Các route admin, landlord và tenant nên có guard/permission khi triển khai auth.

## Hướng Phát Triển Tiếp Theo

Các bước hợp lý sau skeleton:

1. Cài dependencies bằng `pnpm install`.
2. Thêm Prisma module/service cho NestJS backend.
3. Chạy `pnpm db:generate`.
4. Validate và format Prisma schema.
5. Cấu hình Neon PostgreSQL.
6. Chạy migration đầu tiên.
7. Thiết kế authentication flow.
8. Thêm role-based access control.
9. Xây dựng API cho từng domain theo mức ưu tiên.
10. Xây dựng layout frontend cho từng vai trò.
11. Thêm validation, logging, error handling và test.

## Lưu Ý Quan Trọng

Repository này cố ý chưa triển khai UI hoàn chỉnh, backend logic hoặc seed data.
Mọi file hiện tại được tạo nhằm làm nền tảng kiến trúc ban đầu, giúp dự án dễ
mở rộng, dễ phân chia module và dễ phát triển theo từng giai đoạn.
