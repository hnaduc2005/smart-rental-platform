"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

type ReportsOverview = {
  usersByRole: Record<string, number>;
  roomsByStatus: Record<string, number>;
  paymentsByStatus: Array<{ status: string; count: number; amount: string | number }>;
  depositsByStatus: Array<{ status: string; count: number; amount: string | number }>;
  activeContracts: number;
  unpaidInvoices: number;
  activeSubscriptions: number;
  topRooms: Array<{ id: string; name: string; count: number }>;
  topRegions: Array<{ id: string; name: string; count: number }>;
  recentPayments: Array<{ id: string; amount: string | number; status: string; createdAt: string; invoice?: { contract?: { room?: { name: string } | null } | null } | null }>;
};

const roleLabels: Record<string, string> = { ADMIN: "Admin", LANDLORD: "Chủ trọ", TENANT: "Người thuê", SEEKER: "Tìm phòng" };
const roomStatusLabels: Record<string, string> = { AVAILABLE: "Còn trống", DEPOSITED: "Đã đặt cọc", RENTED: "Đã thuê", MAINTENANCE: "Bảo trì", HIDDEN: "Đã ẩn" };

function money(value: string | number) {
  return Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function totalRecord(record: Record<string, number>) {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return <div className="admin-stat-card"><div className="admin-stat-card__label">{label}</div><div className="admin-stat-card__value">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</div><div className="admin-stat-card__sub">{sub}</div></div>;
}

function KeyValueTable({ title, rows }: { title: string; rows: Array<{ label: string; value: string | number }> }) {
  return <div className="admin-table-card"><div className="admin-table-card__header"><span className="admin-table-card__title">{title}</span></div>{rows.length === 0 ? <div className="admin-empty"><p className="admin-empty__title">Chưa có dữ liệu</p></div> : <div className="admin-mini-list">{rows.map((row) => <div className="admin-mini-list__item" key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}</div>}</div>;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<ReportsOverview>("/admin/reports/overview", { token: getStoredAccessToken() });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <div className="admin-empty"><p className="admin-empty__title">Đang tải báo cáo...</p></div>;

  if (error) return <div><div className="admin-page-header"><h1 className="admin-page-header__title">Báo cáo & Thống kê</h1></div><div className="admin-error-box"><p className="admin-error-box__title">Không thể tải báo cáo</p><p className="admin-error-box__msg">{error}</p><button className="admin-error-box__btn" onClick={fetchOverview}>Thử lại</button></div></div>;

  if (!data) return null;

  const paymentAmount = data.paymentsByStatus.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Báo cáo & Thống kê</h1>
        <p className="admin-page-header__desc">Tổng hợp tình hình người dùng, phòng, hợp đồng, hóa đơn và thanh toán từ dữ liệu thật.</p>
      </div>

      <div className="admin-summary-grid">
        <StatCard label="Tổng người dùng" value={totalRecord(data.usersByRole)} sub="Tính theo tài khoản chưa xóa" />
        <StatCard label="Tổng phòng" value={totalRecord(data.roomsByStatus)} sub="Theo mọi trạng thái phòng" />
        <StatCard label="Hợp đồng hiệu lực" value={data.activeContracts} sub="Đang trong thời hạn thuê" />
        <StatCard label="Hóa đơn chưa xử lý" value={data.unpaidInvoices} sub="Chưa thanh toán, quá hạn hoặc chờ xác nhận" />
        <StatCard label="Gói chủ trọ active" value={data.activeSubscriptions} sub="Subscription đang hiệu lực" />
        <StatCard label="Tổng payment" value={money(paymentAmount)} sub="Tổng theo payment hiện có" />
      </div>

      <div className="admin-recent-grid">
        <KeyValueTable title="Người dùng theo vai trò" rows={Object.entries(data.usersByRole).map(([key, value]) => ({ label: roleLabels[key] ?? key, value }))} />
        <KeyValueTable title="Phòng theo trạng thái" rows={Object.entries(data.roomsByStatus).map(([key, value]) => ({ label: roomStatusLabels[key] ?? key, value }))} />
        <KeyValueTable title="Payment theo trạng thái" rows={data.paymentsByStatus.map((row) => ({ label: row.status, value: `${row.count} · ${money(row.amount)}` }))} />
        <KeyValueTable title="Đặt cọc theo trạng thái" rows={data.depositsByStatus.map((row) => ({ label: row.status, value: `${row.count} · ${money(row.amount)}` }))} />
        <KeyValueTable title="Top phòng có yêu cầu thuê" rows={data.topRooms.map((row) => ({ label: row.name, value: row.count }))} />
        <KeyValueTable title="Top khu vực có yêu cầu thuê" rows={data.topRegions.map((row) => ({ label: row.name, value: row.count }))} />
      </div>

      <p className="admin-section-title">Thanh toán gần đây</p>
      <div className="admin-table-wrap">
        {data.recentPayments.length === 0 ? <div className="admin-empty"><p className="admin-empty__title">Chưa có thanh toán</p></div> : <table className="admin-data-table"><thead><tr><th>Phòng</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày tạo</th></tr></thead><tbody>{data.recentPayments.map((payment) => <tr key={payment.id}><td>{payment.invoice?.contract?.room?.name ?? "-"}</td><td>{money(payment.amount)}</td><td><span className="admin-badge admin-badge--blue">{payment.status}</span></td><td>{new Date(payment.createdAt).toLocaleDateString("vi-VN")}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
