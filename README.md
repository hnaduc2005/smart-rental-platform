# 🏠 Smart Rental Platform — Nền Tảng Quản Lý Phòng Trọ Thông Minh

> **Đồ án môn học | Nhóm 7**  
> Hệ thống Web App toàn diện, số hóa và tự động hóa toàn bộ quy trình cho thuê phòng trọ — từ tìm kiếm phòng, quản lý hợp đồng, tính hóa đơn điện/nước đến theo dõi thanh toán.

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Yêu cầu môi trường](#-yêu-cầu-môi-trường)
- [Hướng dẫn cài đặt & chạy](#-hướng-dẫn-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)
- [Database & Prisma](#-database--prisma)
- [Các lệnh thường dùng](#-các-lệnh-thường-dùng)
- [Vai trò người dùng](#-vai-trò-người-dùng)
- [Luồng nghiệp vụ chính](#-luồng-nghiệp-vụ-chính)
- [Nhóm phát triển](#-nhóm-phát-triển)

---

## 🎯 Giới Thiệu

**Smart Rental Platform** là một nền tảng quản lý phòng trọ thông minh dành cho thị trường cho thuê nhà trọ, ký túc xá và căn hộ dịch vụ tại Việt Nam.

### Vấn đề đặt ra

| Đối tượng | Khó khăn |
|-----------|----------|
| **Chủ trọ** | Quản lý thủ công (sổ sách, Excel), dễ sai sót; mất thời gian tính hóa đơn điện/nước hàng tháng |
| **Người thuê** | Khó tìm phòng uy tín phù hợp; thiếu minh bạch trong các khoản phí |
| **Thị trường** | Thiếu nền tảng chuyên biệt kết nối và số hóa quy trình cho thuê |

### Giải pháp

Một Web App tập trung, minh bạch, tự động hóa toàn bộ vòng đời thuê phòng — từ đăng tin → tìm kiếm → đặt lịch xem → ký hợp đồng → quản lý hóa đơn → thanh toán.

---

## ✨ Tính Năng Nổi Bật

### 🔐 Xác thực & Phân quyền
- Đăng ký / Đăng nhập bảo mật với mã hóa mật khẩu (Bcrypt)
- Quản lý phiên đăng nhập bằng JWT (Access Token)
- Phân quyền theo vai trò: Admin / Landlord / Tenant
- Khôi phục mật khẩu qua Email (Nodemailer + Gmail)
- Cập nhật hồ sơ cá nhân, đổi mật khẩu

### 🏘️ Dành cho Chủ Trọ (Landlord)
- Quản lý nhiều khu trọ / dãy trọ khác nhau
- Quản lý phòng theo trạng thái thời gian thực (Trống / Đang thuê / Bảo trì)
- Quản lý danh sách thiết bị, tiện nghi từng phòng
- Duyệt yêu cầu thuê & ký hợp đồng với người thuê
- Ghi chỉ số điện/nước hàng tháng cho từng phòng
- Tự động tính và xuất hóa đơn điện tử
- Xác nhận & theo dõi trạng thái thanh toán
- Dashboard thống kê doanh thu, tỷ lệ lấp đầy phòng
- Quản lý tiền đặt cọc

### 🔍 Dành cho Người Tìm Phòng (Guest)
- Xem danh sách phòng trọ đang trống công khai
- Bộ lọc thông minh: khu vực, giá, diện tích, tiện ích
- Xem chi tiết phòng: ảnh, mô tả, giá, vị trí bản đồ
- Đặt lịch xem phòng trực tuyến
- Gửi yêu cầu thuê phòng

### 🏠 Dành cho Người Thuê (Tenant)
- Dashboard tổng quan: hóa đơn cần thanh toán, thông tin phòng
- Xem chi tiết hóa đơn minh bạch (số điện/nước đầu–cuối, đơn giá, thành tiền)
- Lịch sử thanh toán theo tháng
- Upload minh chứng thanh toán (chuyển khoản)
- Phản ánh sự cố, yêu cầu sửa chữa
- Đánh giá phòng và chủ trọ sau khi ở

### 🛡️ Dành cho Quản Trị Viên (Admin)
- Dashboard tổng quan toàn hệ thống
- Quản lý tài khoản người dùng (khóa / mở khóa)
- Duyệt tài khoản chủ trọ
- Quản lý bài đăng phòng trọ
- Quản lý danh mục và gói dịch vụ
- Xem báo cáo tổng hợp toàn nền tảng

---

## 🛠️ Công Nghệ Sử Dụng

### Kiến trúc & Quản lý dự án

| Công nghệ | Vai trò |
|-----------|---------|
| **pnpm Workspace** | Monorepo — quản lý nhiều app & package trong một repo |
| **TypeScript** | Ngôn ngữ chính, đảm bảo type-safety toàn dự án |

### Frontend

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **Next.js** | 15+ | Framework React, App Router, SSR/SSG |
| **React** | 19 | UI library |
| **TailwindCSS** | 4+ | Styling, responsive UI |
| **Leaflet / React-Leaflet** | — | Bản đồ tương tác hiển thị vị trí phòng |

### Backend

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **NestJS** | 11 | Framework Node.js, kiến trúc module hóa |
| **TypeScript** | 5+ | Type-safe backend |
| **JWT** | — | Xác thực & quản lý phiên |
| **Bcrypt** | — | Mã hóa mật khẩu |
| **Nodemailer** | — | Gửi email (OTP, thông báo) |
| **Multer** | — | Xử lý upload file/ảnh |

### Database

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **PostgreSQL** | — | Hệ quản trị CSDL chính |
| **Neon** | — | Cloud Serverless PostgreSQL hosting |
| **Prisma ORM** | 7 | Schema, migration, query builder |

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                             │
│   Browser ──► Next.js App (Port 3000)                       │
│               App Router | SSR | TailwindCSS | Leaflet      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP / REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│                                                             │
│   NestJS API Server (Port 3001)                             │
│   Global Prefix: /api                                       │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │   Auth   │  │  Rooms   │  │ Invoices │  │  Users   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │Contracts │  │Payments  │  │  Issues  │  │ Reports  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                                                             │
│   PostgreSQL (Neon Cloud)                                   │
│   25+ tables | Migrations | Seed Data                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
smart-rental-platform/
│
├── apps/
│   ├── web/                          # 🌐 Frontend — Next.js App Router
│   │   ├── app/
│   │   │   ├── page.tsx              # Trang chủ / Landing page
│   │   │   ├── auth/                 # Đăng nhập, Đăng ký, Quên mật khẩu
│   │   │   ├── rooms/                # Danh sách & chi tiết phòng (public)
│   │   │   ├── landlord/             # Khu vực Chủ trọ
│   │   │   │   ├── dashboard/
│   │   │   │   ├── properties/       # Quản lý khu trọ
│   │   │   │   ├── rooms/            # Quản lý phòng
│   │   │   │   ├── tenants/          # Quản lý người thuê
│   │   │   │   ├── contracts/        # Hợp đồng
│   │   │   │   ├── deposits/         # Đặt cọc
│   │   │   │   ├── invoices/         # Hóa đơn
│   │   │   │   ├── payments/         # Thanh toán
│   │   │   │   └── reports/          # Báo cáo doanh thu
│   │   │   ├── tenant/               # Khu vực Người thuê
│   │   │   │   ├── dashboard/
│   │   │   │   ├── my-room/          # Thông tin phòng đang thuê
│   │   │   │   ├── invoices/         # Hóa đơn cá nhân
│   │   │   │   ├── payments/         # Lịch sử thanh toán
│   │   │   │   ├── issues/           # Phản ánh sự cố
│   │   │   │   └── reviews/          # Đánh giá phòng
│   │   │   ├── admin/                # Khu vực Admin
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── landlords/
│   │   │   │   ├── room-posts/
│   │   │   │   ├── categories/
│   │   │   │   ├── service-packages/
│   │   │   │   └── reports/
│   │   │   └── profile/              # Hồ sơ người dùng
│   │   ├── components/               # Shared UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Tiện ích phía client
│   │   ├── services/                 # API client adapters
│   │   └── types/                    # TypeScript types (frontend)
│   │
│   └── api/                          # ⚙️ Backend — NestJS
│       └── src/
│           ├── main.ts               # Entry point
│           ├── app.module.ts         # Root module
│           ├── common/               # Guards, interceptors, filters
│           └── modules/              # Domain modules
│               ├── auth/             # Xác thực, JWT
│               ├── users/            # Tài khoản người dùng
│               ├── landlords/        # Hồ sơ chủ trọ
│               ├── tenants/          # Hồ sơ người thuê
│               ├── properties/       # Khu trọ / nhà trọ
│               ├── rooms/            # Phòng trọ
│               ├── room-images/      # Ảnh phòng
│               ├── amenities/        # Tiện nghi phòng
│               ├── viewing-appointments/ # Lịch xem phòng
│               ├── rental-requests/  # Yêu cầu thuê
│               ├── contracts/        # Hợp đồng thuê
│               ├── co-tenants/       # Người ở cùng
│               ├── deposits/         # Đặt cọc
│               ├── meter-readings/   # Chỉ số điện/nước
│               ├── invoices/         # Hóa đơn
│               ├── payments/         # Thanh toán
│               ├── issues/           # Phản ánh sự cố
│               ├── reviews/          # Đánh giá
│               ├── notifications/    # Thông báo
│               ├── service-packages/ # Gói dịch vụ
│               ├── subscriptions/    # Đăng ký gói dịch vụ
│               ├── reports/          # Báo cáo thống kê
│               ├── uploads/          # Upload file/ảnh
│               ├── regions/          # Khu vực địa lý
│               ├── room-types/       # Loại phòng
│               ├── roles/            # Vai trò hệ thống
│               └── admin/            # Quản trị hệ thống
│
├── packages/
│   ├── database/                     # 🗄️ Prisma schema & migrations
│   │   └── prisma/
│   │       ├── schema.prisma         # Data model (25+ models)
│   │       ├── migrations/           # SQL migration history
│   │       └── seed.cjs              # Dữ liệu khởi tạo mẫu
│   │
│   └── shared/                       # 📦 Shared constants, enums, types
│       └── src/
│           ├── constants/
│           ├── enums/
│           └── types/
│
├── docs/                             # 📄 Tài liệu dự án
├── .env                              # Biến môi trường (không commit)
├── .gitignore
├── package.json                      # Root scripts (monorepo)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## ⚙️ Yêu Cầu Môi Trường

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| **Node.js** | >= 20.9.0 |
| **pnpm** | >= 9.0.0 |
| **PostgreSQL** | >= 14 (hoặc dùng Neon Cloud) |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Bước 1: Clone repository

```bash
git clone https://github.com/<your-org>/smart-rental-platform.git
cd smart-rental-platform
```

### Bước 2: Cài đặt pnpm (nếu chưa có)

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

Hoặc cài qua npm:

```bash
npm install -g pnpm
```

### Bước 3: Cài đặt dependencies

```bash
pnpm install
```

### Bước 4: Cấu hình biến môi trường

```bash
cp .env.example .env
```

Mở file `.env` và điền đầy đủ các giá trị (xem chi tiết ở [phần Biến môi trường](#-biến-môi-trường)).

### Bước 5: Khởi tạo database

```bash
# Generate Prisma Client
pnpm db:generate

# Chạy migration tạo bảng
pnpm db:migrate

# (Tùy chọn) Seed dữ liệu mẫu
pnpm db:seed
```

### Bước 6: Chạy ứng dụng

```bash
# Chạy cả Frontend lẫn Backend cùng lúc
pnpm dev
```

Hoặc chạy riêng lẻ:

```bash
# Chỉ chạy Frontend
pnpm --filter @smart-rental/web dev

# Chỉ chạy Backend
pnpm --filter @smart-rental/api dev
```

| Ứng dụng | URL |
|----------|-----|
| **Frontend (Next.js)** | http://localhost:3000 |
| **Backend API (NestJS)** | http://localhost:3001/api |

---

## 🔑 Biến Môi Trường

Tạo file `.env` tại thư mục gốc `smart-rental-platform/` với nội dung sau:

```env
# =============================================
# DATABASE
# =============================================
# Pooled connection — dùng cho Prisma runtime (Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require"

# Direct connection — dùng cho Prisma Migrate
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DBNAME?sslmode=require"

# =============================================
# AUTHENTICATION
# =============================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# =============================================
# EMAIL (Nodemailer + Gmail)
# =============================================
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-gmail@gmail.com"
MAIL_PASS="your-gmail-app-password"
MAIL_FROM="Smart Rental <your-gmail@gmail.com>"

# =============================================
# API URL (dùng cho Frontend gọi Backend)
# =============================================
NEXT_PUBLIC_API_URL="http://localhost:3001"

# =============================================
# FILE UPLOAD
# =============================================
UPLOAD_DIR="uploads"
```

> ⚠️ **Lưu ý bảo mật:** Không bao giờ commit file `.env` lên repository. File này đã được thêm vào `.gitignore`.

> 📌 **Gmail App Password:** Truy cập https://myaccount.google.com/apppasswords để tạo App Password riêng (không dùng mật khẩu Gmail thông thường).

---

## 🗄️ Database & Prisma

### Mô hình dữ liệu

Schema được thiết kế với **25+ model** bao gồm:

**Tài khoản & Phân quyền**
- `User`, `LandlordProfile`, `TenantProfile`

**Bất động sản**
- `Property`, `Room`, `RoomImage`, `Amenity`, `RoomAmenity`, `RoomType`, `Region`

**Quy trình thuê**
- `ViewingAppointment`, `RentalRequest`, `Contract`, `CoTenant`

**Tài chính**
- `Deposit`, `Invoice`, `InvoiceItem`, `MeterReading`, `Payment`, `PaymentMethod`

**Vận hành**
- `IssueReport`, `Notification`, `Review`

**Dịch vụ**
- `ServicePackage`, `LandlordSubscription`

### Các lệnh Prisma thường dùng

```bash
# Generate Prisma Client
pnpm db:generate

# Tạo và chạy migration mới
pnpm db:migrate

# Seed dữ liệu mẫu
pnpm db:seed

# Mở Prisma Studio (giao diện quản lý DB trực quan)
pnpm db:studio

# Format Prisma schema
pnpm --filter @smart-rental/database prisma:format
```

---

## 📜 Các Lệnh Thường Dùng

```bash
# Chạy toàn bộ dự án (dev mode)
pnpm dev

# Build toàn bộ dự án
pnpm build

# Kiểm tra TypeScript
pnpm typecheck

# Lint toàn bộ dự án
pnpm lint

# Database
pnpm db:generate    # Generate Prisma Client
pnpm db:migrate     # Chạy migration
pnpm db:seed        # Seed dữ liệu mẫu
pnpm db:studio      # Mở Prisma Studio
```

---

## 👥 Vai Trò Người Dùng

### 🔍 Guest — Người Tìm Phòng
Người dùng chưa đăng nhập, có thể:
- Xem danh sách phòng trọ đang trống
- Lọc theo khu vực, giá, tiện ích
- Xem chi tiết phòng, hình ảnh, vị trí bản đồ
- **Cần đăng nhập** để đặt lịch xem phòng hoặc gửi yêu cầu thuê

### 🏠 Tenant — Người Thuê
Người dùng đã ký hợp đồng thuê phòng:
- Xem thông tin phòng đang thuê và tiện nghi
- Tra cứu hóa đơn chi tiết hàng tháng
- Upload minh chứng thanh toán
- Gửi yêu cầu sửa chữa, phản ánh sự cố
- Đánh giá phòng và chủ trọ

### 🏘️ Landlord — Chủ Trọ
Người dùng đã được Admin duyệt tài khoản:
- Quản lý toàn bộ khu trọ và phòng
- Xem yêu cầu thuê và duyệt hợp đồng
- Ghi chỉ số điện/nước, tạo hóa đơn tự động
- Xác nhận thanh toán, quản lý đặt cọc
- Xem dashboard doanh thu, báo cáo thống kê

### 🛡️ Admin — Quản Trị Viên
Quản trị toàn bộ nền tảng:
- Xem tổng quan hệ thống (users, landlords, properties)
- Duyệt và quản lý tài khoản chủ trọ
- Khóa/mở khóa tài khoản vi phạm
- Quản lý danh mục, gói dịch vụ
- Xem báo cáo toàn nền tảng

---

## 🔄 Luồng Nghiệp Vụ Chính

### Luồng thuê phòng

```
Guest xem danh sách phòng
    └─► Đặt lịch xem phòng
        └─► Gửi yêu cầu thuê
            └─► Landlord duyệt yêu cầu
                └─► Ký hợp đồng thuê
                    └─► Tenant được cấp tài khoản Tenant
```

### Luồng thanh toán hàng tháng

```
Landlord ghi chỉ số điện/nước
    └─► Hệ thống tự tính hóa đơn
        (Tiền phòng + Điện + Nước + Phí dịch vụ)
        └─► Tenant nhận thông báo hóa đơn
            └─► Tenant xem chi tiết & chuyển khoản
                └─► Upload minh chứng thanh toán
                    └─► Landlord xác nhận
                        └─► Hóa đơn đánh dấu "Đã thanh toán"
```

---

## 📊 Mô Hình Dữ Liệu (ERD Tóm Tắt)

```
User ──── LandlordProfile ──── Property ──── Room
 │                                            │
 └─── TenantProfile ─────── Contract ────────┤
                                 │            │
                              Invoice      RoomImage
                                 │
                              Payment
```

---

## 👨‍💻 Nhóm Phát Triển

**Nhóm 7** — Đồ án môn học

| STT | Họ và Tên | MSSV | Vai trò |
|-----|-----------|------|---------|
| 1 | *(Thành viên 1)* | — | Frontend & Backend |
| 2 | *(Thành viên 2)* | — | Frontend & Backend |
| 3 | *(Thành viên 3)* | — | Frontend & Backend |
| 4 | *(Thành viên 4)* | — | Database & Backend |
| 5 | *(Thành viên 5)* | — | Frontend & Docs |

> 📝 Cập nhật danh sách thành viên thực tế vào bảng trên.

---

## 📄 License

Dự án này được phát triển phục vụ mục đích học thuật trong khuôn khổ đồ án môn học.  
© 2026 Nhóm 7. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ by Nhóm 7 | Smart Rental Platform</sub>
</div>
