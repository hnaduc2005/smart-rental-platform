"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

type Role = "ADMIN" | "LANDLORD" | "SEEKER" | "TENANT";
type UserStatus = "PENDING" | "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

type AdminUser = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
  landlordProfile?: { id: string; businessName: string | null; verificationStatus: string } | null;
  tenantProfile?: { id: string } | null;
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  LANDLORD: "Chủ trọ",
  SEEKER: "Tìm phòng",
  TENANT: "Người thuê"
};

const statusLabels: Record<UserStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Hoạt động",
  LOCKED: "Đã khóa",
  SUSPENDED: "Tạm ngưng",
  DELETED: "Đã xóa"
};

const statusBadge: Record<UserStatus, string> = {
  PENDING: "admin-badge--orange",
  ACTIVE: "admin-badge--green",
  LOCKED: "admin-badge--red",
  SUSPENDED: "admin-badge--red",
  DELETED: "admin-badge--gray"
};

const roles: Role[] = ["ADMIN", "LANDLORD", "SEEKER", "TENANT"];
const statuses: UserStatus[] = ["PENDING", "ACTIVE", "LOCKED", "SUSPENDED", "DELETED"];

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function AdminUsersPage() {
  const [data, setData] = useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getStoredAccessToken();
      const qs = buildQuery({ search, role, status, page, limit: 10 });
      const response = await apiRequest<Paginated<AdminUser>>(`/admin/users?${qs}`, { token });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, page]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateStatus = async (user: AdminUser) => {
    const nextStatus: UserStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    if (!window.confirm(`${nextStatus === "LOCKED" ? "Khóa" : "Mở khóa"} tài khoản ${user.email}?`)) return;

    try {
      setMutatingId(user.id);
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        token: getStoredAccessToken(),
        body: { status: nextStatus }
      });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setMutatingId(null);
    }
  };

  const updateRole = async (user: AdminUser, nextRole: Role) => {
    if (nextRole === user.role) return;
    if (!window.confirm(`Đổi vai trò ${user.email} thành ${roleLabels[nextRole]}?`)) return;

    try {
      setMutatingId(user.id);
      await apiRequest(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        token: getStoredAccessToken(),
        body: { role: nextRole }
      });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi vai trò.");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Quản lý người dùng</h1>
        <p className="admin-page-header__desc">Tìm kiếm, lọc, khóa/mở khóa và điều chỉnh vai trò tài khoản trong hệ thống.</p>
      </div>

      <div className="admin-toolbar">
        <input className="admin-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm email, tên, số điện thoại" />
        <select className="admin-select" value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
          <option value="">Tất cả vai trò</option>
          {roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}
        </select>
        <select className="admin-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">Tất cả trạng thái</option>
          {statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
        </select>
        <button className="admin-button admin-button--primary" onClick={applySearch}>Tìm kiếm</button>
      </div>

      {error && (
        <div className="admin-error-box" style={{ marginBottom: 16 }}>
          <p className="admin-error-box__title">Không thể xử lý yêu cầu</p>
          <p className="admin-error-box__msg">{error}</p>
          <button className="admin-error-box__btn" onClick={fetchUsers}>Thử lại</button>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty"><p className="admin-empty__title">Đang tải danh sách người dùng...</p></div>
        ) : !data || data.items.length === 0 ? (
          <div className="admin-empty"><p className="admin-empty__title">Không có người dùng phù hợp</p></div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Người dùng</th>
                <th style={{ width: "14%" }}>Vai trò</th>
                <th style={{ width: "14%" }}>Trạng thái</th>
                <th style={{ width: "14%" }}>Ngày tạo</th>
                <th style={{ width: "28%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-cell-main">
                      <div className="admin-cell-title">{user.fullName ?? user.email}</div>
                      <div className="admin-cell-sub">{user.email}{user.phone ? ` · ${user.phone}` : ""}</div>
                    </div>
                  </td>
                  <td><span className="admin-badge admin-badge--blue">{roleLabels[user.role]}</span></td>
                  <td><span className={`admin-badge ${statusBadge[user.status]}`}>{statusLabels[user.status]}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <select className="admin-select" value={user.role} disabled={mutatingId === user.id} onChange={(e) => updateRole(user, e.target.value as Role)}>
                        {roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}
                      </select>
                      <button className={user.status === "ACTIVE" ? "admin-button admin-button--danger" : "admin-button admin-button--success"} disabled={mutatingId === user.id || user.status === "DELETED"} onClick={() => updateStatus(user)}>
                        {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="admin-pagination">
          <span>{data ? `Tổng ${data.total} người dùng · Trang ${data.page}/${data.totalPages}` : "-"}</span>
          <div className="admin-pagination__actions">
            <button className="admin-button" disabled={!data || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button>
            <button className="admin-button" disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
