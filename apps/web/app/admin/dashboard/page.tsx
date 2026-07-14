"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

/* ─── Types ─────────────────────────────────────────────── */
interface RecentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  createdAt: string;
}

interface RecentRentalRequest {
  id: string;
  status: string;
  createdAt: string;
  seeker: { fullName: string | null; email: string } | null;
  room: { name: string } | null;
}

interface RecentInvoice {
  id: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  contract: { room: { name: string } | null } | null;
}

interface DashboardSummary {
  totalUsers: number;
  totalLandlords: number;
  pendingLandlords: number;
  totalTenants: number;
  totalSeekers: number;
  activeRooms: number;
  availableRooms: number;
  rentedRooms: number;
  pendingRentalRequests: number;
  activeContracts: number;
  unpaidInvoices: number;
  activeServicePackages: number;
  recentUsers: RecentUser[];
  recentRentalRequests: RecentRentalRequest[];
  recentInvoices: RecentInvoice[];
}

/* ─── Stat Card ─────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  iconColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, iconColor, iconBg, icon }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__top">
        <span className="admin-stat-card__label">{label}</span>
        <div className="admin-stat-card__icon-wrap" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="admin-stat-card__value">{value.toLocaleString()}</div>
      <div className="admin-stat-card__sub">{sub}</div>
    </div>
  );
}

/* ─── Task Card ──────────────────────────────────────────── */
interface TaskCardProps {
  label: string;
  hint: string;
  count: number;
  href: string;
}

function TaskCard({ label, hint, count, href }: TaskCardProps) {
  return (
    <Link href={href} className="admin-task-card">
      <div className="admin-task-card__info">
        <div className="admin-task-card__label">{label}</div>
        <div className="admin-task-card__hint">{hint}</div>
      </div>
      <span className={`admin-task-card__count${count === 0 ? " admin-task-card__count--zero" : ""}`}>
        {count}
      </span>
    </Link>
  );
}

/* ─── Role Badge ─────────────────────────────────────────── */
const roleBadgeClass: Record<string, string> = {
  ADMIN: "admin-badge--purple",
  LANDLORD: "admin-badge--blue",
  TENANT: "admin-badge--green",
  SEEKER: "admin-badge--gray",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  LANDLORD: "Chủ trọ",
  TENANT: "Người thuê",
  SEEKER: "Tìm phòng",
};

/* ─── Status Badge ───────────────────────────────────────── */
const statusBadgeClass: Record<string, string> = {
  PENDING: "admin-badge--orange",
  APPROVED: "admin-badge--green",
  ACTIVE: "admin-badge--green",
  UNPAID: "admin-badge--red",
  OVERDUE: "admin-badge--red",
  PENDING_CONFIRMATION: "admin-badge--orange",
  CANCELLED: "admin-badge--gray",
  REJECTED: "admin-badge--red",
};

const statusLabel: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  ACTIVE: "Hiệu lực",
  UNPAID: "Chưa TT",
  OVERDUE: "Quá hạn",
  PENDING_CONFIRMATION: "Chờ xác nhận",
  CANCELLED: "Đã hủy",
  REJECTED: "Từ chối",
};

/* ─── Recent Tables ──────────────────────────────────────── */
function EmptyRow({ message }: { message: string }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="admin-empty__title">{message}</p>
    </div>
  );
}

function RecentUsersTable({ users }: { users: RecentUser[] }) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-card__header">
        <span className="admin-table-card__title">Người dùng mới gần đây</span>
        <Link href="/admin/users" className="admin-table-card__link">Xem tất cả →</Link>
      </div>
      <div className="admin-table-card__body">
        {users.length === 0 ? (
          <EmptyRow message="Chưa có người dùng nào" />
        ) : (
          users.map((u) => (
            <div key={u.id} className="admin-table-row">
              <div className="admin-table-row__avatar">
                {(u.fullName ?? u.email)[0].toUpperCase()}
              </div>
              <div className="admin-table-row__main">
                <div className="admin-table-row__name">{u.fullName ?? "—"}</div>
                <div className="admin-table-row__sub">{u.email}</div>
              </div>
              <span className={`admin-badge ${roleBadgeClass[u.role] ?? "admin-badge--gray"}`}>
                {roleLabel[u.role] ?? u.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentRequestsTable({ requests }: { requests: RecentRentalRequest[] }) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-card__header">
        <span className="admin-table-card__title">Yêu cầu thuê gần đây</span>
        <Link href="/admin/room-posts" className="admin-table-card__link">Xem tất cả →</Link>
      </div>
      <div className="admin-table-card__body">
        {requests.length === 0 ? (
          <EmptyRow message="Chưa có yêu cầu nào" />
        ) : (
          requests.map((r) => (
            <div key={r.id} className="admin-table-row">
              <div className="admin-table-row__avatar" style={{ background: "#fff7ed", color: "#ea580c" }}>
                {(r.seeker?.fullName ?? r.seeker?.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="admin-table-row__main">
                <div className="admin-table-row__name">
                  {r.seeker?.fullName ?? r.seeker?.email ?? "Không rõ"}
                </div>
                <div className="admin-table-row__sub">Phòng: {r.room?.name ?? "—"}</div>
              </div>
              <span className={`admin-badge ${statusBadgeClass[r.status] ?? "admin-badge--gray"}`}>
                {statusLabel[r.status] ?? r.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentInvoicesTable({ invoices }: { invoices: RecentInvoice[] }) {
  const fmt = (v: string | number) =>
    Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="admin-table-card">
      <div className="admin-table-card__header">
        <span className="admin-table-card__title">Hóa đơn gần đây</span>
        <Link href="/admin/reports" className="admin-table-card__link">Xem tất cả →</Link>
      </div>
      <div className="admin-table-card__body">
        {invoices.length === 0 ? (
          <EmptyRow message="Chưa có hóa đơn nào" />
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="admin-table-row">
              <div className="admin-table-row__avatar" style={{ background: "#fef2f2", color: "#dc2626" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                </svg>
              </div>
              <div className="admin-table-row__main">
                <div className="admin-table-row__name">{fmt(inv.totalAmount)}</div>
                <div className="admin-table-row__sub">Phòng: {inv.contract?.room?.name ?? "—"}</div>
              </div>
              <span className={`admin-badge ${statusBadgeClass[inv.status] ?? "admin-badge--gray"}`}>
                {statusLabel[inv.status] ?? inv.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ───────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-skeleton" style={{ height: 26, width: 240, marginBottom: 8 }} />
        <div className="admin-skeleton" style={{ height: 16, width: 360 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <div className="admin-skeleton" style={{ height: 14, width: 120, marginBottom: 14 }} />
      </div>
      <div className="admin-stat-grid" style={{ marginBottom: 28 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="admin-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="admin-skeleton" style={{ height: 13, width: 100 }} />
              <div className="admin-skeleton" style={{ height: 38, width: 38, borderRadius: 10 }} />
            </div>
            <div className="admin-skeleton" style={{ height: 32, width: 60 }} />
            <div className="admin-skeleton" style={{ height: 12, width: 140 }} />
          </div>
        ))}
      </div>
      <div className="admin-skeleton" style={{ height: 14, width: 150, marginBottom: 14 }} />
      <div className="admin-task-grid" style={{ marginBottom: 28 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="admin-task-card" style={{ pointerEvents: "none" }}>
            <div>
              <div className="admin-skeleton" style={{ height: 14, width: 130, marginBottom: 6 }} />
              <div className="admin-skeleton" style={{ height: 12, width: 90 }} />
            </div>
            <div className="admin-skeleton" style={{ height: 30, width: 40 }} />
          </div>
        ))}
      </div>
      <div className="admin-skeleton" style={{ height: 14, width: 140, marginBottom: 14 }} />
      <div className="admin-recent-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="admin-table-card">
            <div className="admin-table-card__header">
              <div className="admin-skeleton" style={{ height: 14, width: 160 }} />
            </div>
            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(3)].map((_, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="admin-skeleton" style={{ height: 34, width: 34, borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div className="admin-skeleton" style={{ height: 13, width: "70%", marginBottom: 6 }} />
                    <div className="admin-skeleton" style={{ height: 12, width: "50%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat config ────────────────────────────────────────── */
function buildStatCards(s: DashboardSummary): StatCardProps[] {
  return [
    {
      label: "Tổng người dùng",
      value: s.totalUsers,
      sub: `${s.totalLandlords} chủ trọ · ${s.totalTenants} người thuê · ${s.totalSeekers} tìm phòng`,
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Chủ trọ chờ duyệt",
      value: s.pendingLandlords,
      sub: "Cần xem xét và phê duyệt",
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: "Phòng đang hoạt động",
      value: s.activeRooms,
      sub: `${s.availableRooms} trống · ${s.rentedRooms} đang thuê`,
      iconBg: "#f0fdf4",
      iconColor: "#16a34a",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Phòng còn trống",
      value: s.availableRooms,
      sub: "Đang chờ người thuê",
      iconBg: "#ecfdf5",
      iconColor: "#059669",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12h6" />
        </svg>
      ),
    },
    {
      label: "Yêu cầu thuê đang chờ",
      value: s.pendingRentalRequests,
      sub: "Cần chủ trọ phản hồi",
      iconBg: "#fefce8",
      iconColor: "#ca8a04",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      ),
    },
    {
      label: "Hợp đồng hiệu lực",
      value: s.activeContracts,
      sub: "Đang trong thời hạn thuê",
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      label: "Hóa đơn chưa thanh toán",
      value: s.unpaidInvoices,
      sub: "Đang chờ xử lý hoặc quá hạn",
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Gói dịch vụ hoạt động",
      value: s.activeServicePackages,
      sub: "Đang cung cấp cho chủ trọ",
      iconBg: "#faf5ff",
      iconColor: "#7c3aed",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getStoredAccessToken();
      const data = await apiRequest<DashboardSummary>("/admin/dashboard-summary", {
        method: "GET",
        token,
      });
      setSummary(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải dữ liệu.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div>
        <div className="admin-page-header">
          <h1 className="admin-page-header__title">Tổng quan quản trị</h1>
        </div>
        <div className="admin-error-box">
          <p className="admin-error-box__title">Không thể tải dữ liệu</p>
          <p className="admin-error-box__msg">{error}</p>
          <button className="admin-error-box__btn" onClick={fetchSummary}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const statCards = buildStatCards(summary);

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Tổng quan quản trị</h1>
        <p className="admin-page-header__desc">
          Theo dõi tình trạng người dùng, phòng trọ, yêu cầu thuê và thanh toán.
        </p>
      </div>

      {/* Stat cards */}
      <p className="admin-section-title">Thống kê tổng quan</p>
      <div className="admin-stat-grid">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Việc cần xử lý */}
      <p className="admin-section-title">Việc cần xử lý</p>
      <div className="admin-task-grid">
        <TaskCard
          label="Chủ trọ chờ duyệt"
          hint="Xét duyệt hồ sơ đăng ký"
          count={summary.pendingLandlords}
          href="/admin/landlords"
        />
        <TaskCard
          label="Yêu cầu thuê đang chờ"
          hint="Cần chủ trọ phản hồi"
          count={summary.pendingRentalRequests}
          href="/admin/room-posts"
        />
        <TaskCard
          label="Hóa đơn chưa thanh toán"
          hint="Quá hạn hoặc chờ xác nhận"
          count={summary.unpaidInvoices}
          href="/admin/reports"
        />
      </div>

      {/* Recent tables */}
      <p className="admin-section-title">Dữ liệu gần đây</p>
      <div className="admin-recent-grid">
        <RecentUsersTable users={summary.recentUsers} />
        <RecentRequestsTable requests={summary.recentRentalRequests} />
        <RecentInvoicesTable invoices={summary.recentInvoices} />
      </div>
    </div>
  );
}
