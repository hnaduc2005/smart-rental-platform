"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

type Landlord = {
  id: string;
  publicDisplayName: string | null;
  publicPhone: string | null;
  publicEmail: string | null;
  businessName: string | null;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  rejectedReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; phone: string | null; fullName: string | null; status: string; role: string };
  _count?: { properties: number; contracts: number; subscriptions: number };
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

const statusLabels: Record<VerificationStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối"
};

const statusBadge: Record<VerificationStatus, string> = {
  PENDING: "admin-badge--orange",
  APPROVED: "admin-badge--green",
  REJECTED: "admin-badge--red"
};

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

export default function AdminLandlordsPage() {
  const [data, setData] = useState<Paginated<Landlord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Landlord | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Landlord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = buildQuery({ search, verificationStatus: status, page, limit: 10 });
      const response = await apiRequest<Paginated<Landlord>>(`/admin/landlords?${qs}`, { token: getStoredAccessToken() });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách chủ trọ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, [search, status, page]);

  const approve = async (landlord: Landlord) => {
    if (!window.confirm(`Duyệt hồ sơ ${landlord.user.email}?`)) return;
    try {
      setMutatingId(landlord.id);
      await apiRequest(`/admin/landlords/${landlord.id}/approve`, { method: "PATCH", token: getStoredAccessToken() });
      await fetchLandlords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể duyệt chủ trọ.");
    } finally {
      setMutatingId(null);
    }
  };

  const reject = async () => {
    if (!rejectTarget) return;
    try {
      setMutatingId(rejectTarget.id);
      await apiRequest(`/admin/landlords/${rejectTarget.id}/reject`, {
        method: "PATCH",
        token: getStoredAccessToken(),
        body: { reason: rejectReason }
      });
      setRejectTarget(null);
      setRejectReason("");
      await fetchLandlords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể từ chối hồ sơ.");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Quản lý chủ trọ</h1>
        <p className="admin-page-header__desc">Duyệt hồ sơ chủ trọ, theo dõi trạng thái xác minh và thông tin vận hành.</p>
      </div>

      <div className="admin-toolbar">
        <input className="admin-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm tên, email, điện thoại" />
        <select className="admin-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <button className="admin-button admin-button--primary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>Tìm kiếm</button>
      </div>

      {error && <div className="admin-error-box" style={{ marginBottom: 16 }}><p className="admin-error-box__title">Không thể xử lý yêu cầu</p><p className="admin-error-box__msg">{error}</p><button className="admin-error-box__btn" onClick={fetchLandlords}>Thử lại</button></div>}

      <div className="admin-table-wrap">
        {loading ? <div className="admin-empty"><p className="admin-empty__title">Đang tải danh sách chủ trọ...</p></div> : !data || data.items.length === 0 ? <div className="admin-empty"><p className="admin-empty__title">Không có chủ trọ phù hợp</p></div> : (
          <table className="admin-data-table">
            <thead><tr><th style={{ width: "30%" }}>Chủ trọ</th><th style={{ width: "18%" }}>Trạng thái</th><th style={{ width: "18%" }}>Quy mô</th><th style={{ width: "14%" }}>Ngày tạo</th><th style={{ width: "20%" }}>Thao tác</th></tr></thead>
            <tbody>
              {data.items.map((landlord) => (
                <tr key={landlord.id}>
                  <td><div className="admin-cell-main"><div className="admin-cell-title">{landlord.businessName ?? landlord.publicDisplayName ?? landlord.user.fullName ?? landlord.user.email}</div><div className="admin-cell-sub">{landlord.user.email}{landlord.user.phone ? ` · ${landlord.user.phone}` : ""}</div></div></td>
                  <td><span className={`admin-badge ${statusBadge[landlord.verificationStatus]}`}>{statusLabels[landlord.verificationStatus]}</span></td>
                  <td>{landlord._count?.properties ?? 0} nhà · {landlord._count?.contracts ?? 0} HĐ</td>
                  <td>{formatDate(landlord.createdAt)}</td>
                  <td><div className="admin-actions"><button className="admin-button" onClick={() => setSelected(landlord)}>Chi tiết</button>{landlord.verificationStatus !== "APPROVED" && <button className="admin-button admin-button--success" disabled={mutatingId === landlord.id} onClick={() => approve(landlord)}>Duyệt</button>}{landlord.verificationStatus !== "REJECTED" && <button className="admin-button admin-button--danger" disabled={mutatingId === landlord.id} onClick={() => setRejectTarget(landlord)}>Từ chối</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="admin-pagination"><span>{data ? `Tổng ${data.total} chủ trọ · Trang ${data.page}/${data.totalPages}` : "-"}</span><div className="admin-pagination__actions"><button className="admin-button" disabled={!data || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button><button className="admin-button" disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button></div></div>
      </div>

      {selected && <div className="admin-modal-backdrop"><div className="admin-modal"><div className="admin-modal__header"><h2 className="admin-modal__title">Chi tiết chủ trọ</h2><button className="admin-button" onClick={() => setSelected(null)}>Đóng</button></div><div className="admin-modal__body"><p><strong>Email:</strong> {selected.user.email}</p><p><strong>Họ tên:</strong> {selected.user.fullName ?? "-"}</p><p><strong>Điện thoại:</strong> {selected.user.phone ?? selected.publicPhone ?? "-"}</p><p><strong>Doanh nghiệp:</strong> {selected.businessName ?? "-"}</p><p><strong>Ghi chú xác minh:</strong> {selected.verificationNote ?? selected.rejectedReason ?? "-"}</p><p><strong>Ngày duyệt:</strong> {formatDate(selected.verifiedAt)}</p></div></div></div>}

      {rejectTarget && <div className="admin-modal-backdrop"><div className="admin-modal"><div className="admin-modal__header"><h2 className="admin-modal__title">Từ chối hồ sơ</h2><button className="admin-button" onClick={() => setRejectTarget(null)}>Đóng</button></div><div className="admin-modal__body"><div className="admin-form-row"><label>Lý do từ chối</label><textarea className="admin-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhập lý do để chủ trọ biết cần bổ sung gì" /></div></div><div className="admin-modal__footer"><button className="admin-button" onClick={() => setRejectTarget(null)}>Hủy</button><button className="admin-button admin-button--danger" disabled={!rejectReason.trim() || mutatingId === rejectTarget.id} onClick={reject}>Xác nhận từ chối</button></div></div></div>}
    </div>
  );
}
