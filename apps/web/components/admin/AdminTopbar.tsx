"use client";

interface AdminTopbarProps {
  pageLabel: string;
  adminEmail?: string;
}

const pageLabelMap: Record<string, string> = {
  "/admin/dashboard": "Tổng quan",
  "/admin/users": "Người dùng",
  "/admin/landlords": "Chủ trọ",
  "/admin/room-posts": "Tin phòng trọ",
  "/admin/categories": "Danh mục",
  "/admin/service-packages": "Gói dịch vụ",
  "/admin/reports": "Báo cáo",
};

export function AdminTopbar({ pageLabel, adminEmail }: AdminTopbarProps) {
  const initial = (adminEmail ?? "A")[0].toUpperCase();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__breadcrumb">
        <span>Admin</span>
        <span className="admin-topbar__breadcrumb-sep">/</span>
        <span className="admin-topbar__breadcrumb-current">{pageLabel}</span>
      </div>
      <div className="admin-topbar__right">
        <div className="admin-topbar__badge">
          <div className="admin-topbar__avatar">{initial}</div>
          <span>{adminEmail ?? "Admin"}</span>
        </div>
      </div>
    </header>
  );
}

export { pageLabelMap };
