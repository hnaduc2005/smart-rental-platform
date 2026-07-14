"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";

type Kind = "room-types" | "amenities" | "regions";
type Item = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
  _count?: Record<string, number>;
};
type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

type FormState = { name: string; slug: string; description: string; parentId: string };

const tabs: Array<{ key: Kind; label: string; description: string }> = [
  { key: "room-types", label: "Loại phòng", description: "Quản lý nhóm phân loại phòng trọ." },
  { key: "amenities", label: "Tiện ích", description: "Quản lý tiện ích gắn với phòng." },
  { key: "regions", label: "Khu vực", description: "Quản lý tỉnh/thành, quận/huyện và khu vực." }
];

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

function emptyForm(): FormState {
  return { name: "", slug: "", description: "", parentId: "" };
}

export default function AdminCategoriesPage() {
  const [active, setActive] = useState<Kind>("room-types");
  const [data, setData] = useState<Paginated<Item> | null>(null);
  const [regions, setRegions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const currentTab = tabs.find((tab) => tab.key === active)!;

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = buildQuery({ search, isActive: activeFilter, page, limit: 10 });
      const response = await apiRequest<Paginated<Item>>(`/admin/${active}?${qs}`, { token: getStoredAccessToken() });
      setData(response);
      if (active === "regions") setRegions(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionOptions = async () => {
    try {
      const response = await apiRequest<Paginated<Item>>("/admin/regions?limit=100", { token: getStoredAccessToken() });
      setRegions(response.items);
    } catch {
      setRegions([]);
    }
  };

  useEffect(() => {
    fetchItems();
    if (active !== "regions") fetchRegionOptions();
  }, [active, search, activeFilter, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      parentId: item.parentId ?? ""
    });
    setModalOpen(true);
  };

  const save = async () => {
    const body = active === "regions"
      ? { name: form.name, slug: form.slug || undefined, parentId: form.parentId || undefined }
      : { name: form.name, slug: form.slug || undefined, description: form.description || undefined };

    try {
      setMutatingId(editing?.id ?? "new");
      await apiRequest(editing ? `/admin/${active}/${editing.id}` : `/admin/${active}`, {
        method: editing ? "PATCH" : "POST",
        token: getStoredAccessToken(),
        body
      });
      setModalOpen(false);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu danh mục.");
    } finally {
      setMutatingId(null);
    }
  };

  const toggleActive = async (item: Item) => {
    try {
      setMutatingId(item.id);
      await apiRequest(`/admin/${active}/${item.id}/disable`, {
        method: "PATCH",
        token: getStoredAccessToken(),
        body: { isActive: !item.isActive }
      });
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái danh mục.");
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Quản lý danh mục</h1>
        <p className="admin-page-header__desc">Quản lý loại phòng, tiện ích và khu vực dùng chung trong toàn hệ thống.</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => <button key={tab.key} className={`admin-tab${active === tab.key ? " admin-tab--active" : ""}`} onClick={() => { setActive(tab.key); setPage(1); setSearch(""); setSearchInput(""); }}>{tab.label}</button>)}
      </div>

      <div className="admin-toolbar">
        <input className="admin-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Tìm ${currentTab.label.toLowerCase()}`} />
        <select className="admin-select" value={activeFilter} onChange={(e) => { setPage(1); setActiveFilter(e.target.value); }}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang dùng</option>
          <option value="false">Đã ẩn</option>
        </select>
        <button className="admin-button admin-button--primary" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>Tìm kiếm</button>
        <button className="admin-button admin-button--success" onClick={openCreate}>Thêm {currentTab.label.toLowerCase()}</button>
      </div>

      {error && <div className="admin-error-box" style={{ marginBottom: 16 }}><p className="admin-error-box__title">Không thể xử lý yêu cầu</p><p className="admin-error-box__msg">{error}</p><button className="admin-error-box__btn" onClick={fetchItems}>Thử lại</button></div>}

      <div className="admin-table-wrap">
        {loading ? <div className="admin-empty"><p className="admin-empty__title">Đang tải {currentTab.label.toLowerCase()}...</p></div> : !data || data.items.length === 0 ? <div className="admin-empty"><p className="admin-empty__title">Không có dữ liệu phù hợp</p><p className="admin-empty__desc">{currentTab.description}</p></div> : (
          <table className="admin-data-table">
            <thead><tr><th style={{ width: "28%" }}>Tên</th><th style={{ width: "22%" }}>Slug</th><th style={{ width: "22%" }}>Thông tin</th><th style={{ width: "12%" }}>Trạng thái</th><th style={{ width: "16%" }}>Thao tác</th></tr></thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td><div className="admin-cell-title">{item.name}</div></td>
                  <td><code>{item.slug}</code></td>
                  <td><div className="admin-cell-sub">{active === "regions" ? (item.parent?.name ? `Thuộc ${item.parent.name}` : "Cấp gốc") : (item.description ?? "-")}</div></td>
                  <td><span className={`admin-badge ${item.isActive ? "admin-badge--green" : "admin-badge--gray"}`}>{item.isActive ? "Đang dùng" : "Đã ẩn"}</span></td>
                  <td><div className="admin-actions"><button className="admin-button" onClick={() => openEdit(item)}>Sửa</button><button className={item.isActive ? "admin-button admin-button--danger" : "admin-button admin-button--success"} disabled={mutatingId === item.id} onClick={() => toggleActive(item)}>{item.isActive ? "Ẩn" : "Hiện"}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="admin-pagination"><span>{data ? `Tổng ${data.total} mục · Trang ${data.page}/${data.totalPages}` : "-"}</span><div className="admin-pagination__actions"><button className="admin-button" disabled={!data || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button><button className="admin-button" disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button></div></div>
      </div>

      {modalOpen && <div className="admin-modal-backdrop"><div className="admin-modal"><div className="admin-modal__header"><h2 className="admin-modal__title">{editing ? "Sửa" : "Thêm"} {currentTab.label.toLowerCase()}</h2><button className="admin-button" onClick={() => setModalOpen(false)}>Đóng</button></div><div className="admin-modal__body"><div className="admin-form-row"><label>Tên</label><input className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="admin-form-row"><label>Slug</label><input className="admin-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Tự sinh nếu bỏ trống" /></div>{active === "regions" ? <div className="admin-form-row"><label>Khu vực cha</label><select className="admin-select" value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}><option value="">Cấp gốc</option>{regions.filter((region) => region.id !== editing?.id).map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></div> : <div className="admin-form-row"><label>Mô tả</label><textarea className="admin-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>}</div><div className="admin-modal__footer"><button className="admin-button" onClick={() => setModalOpen(false)}>Hủy</button><button className="admin-button admin-button--primary" disabled={!form.name.trim() || mutatingId !== null} onClick={save}>Lưu</button></div></div></div>}
    </div>
  );
}
