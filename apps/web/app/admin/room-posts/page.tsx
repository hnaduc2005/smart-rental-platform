"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

type RoomStatus = "AVAILABLE" | "DEPOSITED" | "RENTED" | "MAINTENANCE" | "HIDDEN";

type Room = {
  id: string;
  name: string;
  address: string | null;
  price: string | number;
  area: string | number | null;
  status: RoomStatus;
  createdAt: string;
  property: {
    name: string;
    address: string;
    landlord: { id: string; publicDisplayName: string | null; user: { fullName: string | null; email: string; phone: string | null } };
  };
  roomType: { name: string } | null;
  region: { name: string } | null;
  _count?: { rentalRequests: number; contracts: number; reviews: number };
};

type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: "Còn trống",
  DEPOSITED: "Đã đặt cọc",
  RENTED: "Đã thuê",
  MAINTENANCE: "Bảo trì",
  HIDDEN: "Đã ẩn"
};

const statusBadge: Record<RoomStatus, string> = {
  AVAILABLE: "admin-badge--green",
  DEPOSITED: "admin-badge--orange",
  RENTED: "admin-badge--blue",
  MAINTENANCE: "admin-badge--red",
  HIDDEN: "admin-badge--gray"
};

const statuses: RoomStatus[] = ["AVAILABLE", "DEPOSITED", "RENTED", "MAINTENANCE", "HIDDEN"];

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function AdminRoomPostsPage() {
  const [data, setData] = useState<Paginated<Room> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = buildQuery({ search, status, page, limit: 10 });
      const response = await apiRequest<Paginated<Room>>(`/admin/rooms?${qs}`, { token: getStoredAccessToken() });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, status, page]);

  const updateStatus = async (room: Room, nextStatus: RoomStatus) => {
    if (nextStatus === room.status) return;
    if (!window.confirm(`Đổi trạng thái ${room.name} thành ${statusLabels[nextStatus]}?`)) return;

    try {
      setMutatingId(room.id);
      await apiRequest(`/admin/rooms/${room.id}/status`, {
        method: "PATCH",
        token: getStoredAccessToken(),
        body: { status: nextStatus }
      });
      await fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái phòng.");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Quản lý tin phòng trọ</h1>
        <p className="admin-page-header__desc">Theo dõi toàn bộ phòng đăng trên hệ thống và đổi trạng thái khi cần kiểm duyệt.</p>
      </div>

      <div className="admin-toolbar">
        <input className="admin-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Tìm tên phòng, địa chỉ, chủ trọ" />
        <select className="admin-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">Tất cả trạng thái</option>
          {statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
        </select>
        <button className="admin-button admin-button--primary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>Tìm kiếm</button>
      </div>

      {error && <div className="admin-error-box" style={{ marginBottom: 16 }}><p className="admin-error-box__title">Không thể xử lý yêu cầu</p><p className="admin-error-box__msg">{error}</p><button className="admin-error-box__btn" onClick={fetchRooms}>Thử lại</button></div>}

      <div className="admin-table-wrap">
        {loading ? <div className="admin-empty"><p className="admin-empty__title">Đang tải danh sách phòng...</p></div> : !data || data.items.length === 0 ? <div className="admin-empty"><p className="admin-empty__title">Không có phòng phù hợp</p></div> : (
          <table className="admin-data-table">
            <thead><tr><th style={{ width: "28%" }}>Phòng</th><th style={{ width: "22%" }}>Chủ trọ</th><th style={{ width: "16%" }}>Giá</th><th style={{ width: "14%" }}>Trạng thái</th><th style={{ width: "20%" }}>Thao tác</th></tr></thead>
            <tbody>
              {data.items.map((room) => (
                <tr key={room.id}>
                  <td><div className="admin-cell-main"><div className="admin-cell-title">{room.name}</div><div className="admin-cell-sub">{room.address ?? room.property.address}{room.region ? ` · ${room.region.name}` : ""}</div></div></td>
                  <td><div className="admin-cell-main"><div className="admin-cell-title">{room.property.landlord.publicDisplayName ?? room.property.landlord.user.fullName ?? room.property.landlord.user.email}</div><div className="admin-cell-sub">{room.property.name}</div></div></td>
                  <td><div className="admin-cell-main"><div className="admin-cell-title">{formatMoney(room.price)}</div><div className="admin-cell-sub">{room.area ? `${room.area} m2` : "-"} · {room.roomType?.name ?? "Chưa phân loại"}</div></div></td>
                  <td><span className={`admin-badge ${statusBadge[room.status]}`}>{statusLabels[room.status]}</span></td>
                  <td><div className="admin-actions"><select className="admin-select" value={room.status} disabled={mutatingId === room.id} onChange={(e) => updateStatus(room, e.target.value as RoomStatus)}>{statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="admin-pagination"><span>{data ? `Tổng ${data.total} phòng · Trang ${data.page}/${data.totalPages}` : "-"}</span><div className="admin-pagination__actions"><button className="admin-button" disabled={!data || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button><button className="admin-button" disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button></div></div>
      </div>
    </div>
  );
}
