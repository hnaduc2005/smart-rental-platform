"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { ROOM_STATUS_MAP, translateStatus } from "@/lib/status-translators";
import styles from "./rooms.module.css";
import { toast } from "react-hot-toast";

interface Room {
  id: string;
  propertyId: string;
  propertyName?: string;
  property?: { name: string };
  name: string;
  price: number;
  area: number;
  maxOccupants: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DEPOSITED" | "HIDDEN";
  description?: string;
  rules?: string;
  publicContactName?: string;
  publicContactPhone?: string;
  amenities?: { amenityId: string; amenity: { id: string; name: string; icon?: string } }[];
  images?: any[];
}

interface Property {
  id: string;
  name: string;
}

interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export default function LandlordRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [propsData, roomsData, user, amenitiesData] = await Promise.all([
        apiRequest<Property[]>("/properties/my", { token }),
        apiRequest<Room[]>("/rooms/my", { token }),
        getCurrentUser(token),
        apiRequest<Amenity[]>("/amenities", { token })
      ]);
      setProperties(propsData);
      setRooms(roomsData);
      setCurrentUser(user);
      setAllAmenities(amenitiesData);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Form states
  const [propertyId, setPropertyId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [maxOccupants, setMaxOccupants] = useState("2");
  const [status, setStatus] = useState<Room["status"]>("AVAILABLE");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [publicContactName, setPublicContactName] = useState("");
  const [publicContactPhone, setPublicContactPhone] = useState("");
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleOpenCreateModal = () => {
    if (properties.length === 0) {
      toast("Bạn cần tạo ít nhất 1 Khu trọ trước khi thêm phòng.");
      return;
    }
    setEditingRoom(null);
    setPropertyId(properties[0].id);
    setName("");
    setPrice("");
    setArea("");
    setMaxOccupants("2");
    setStatus("AVAILABLE");
    setDescription("");
    setRules("");
    setPublicContactName(currentUser?.fullName || "");
    setPublicContactPhone(currentUser?.phone || "");
    setAmenityIds([]);
    setImages([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setPropertyId(room.propertyId);
    setName(room.name);
    setPrice(room.price.toString());
    setArea(room.area.toString());
    setMaxOccupants(room.maxOccupants.toString());
    setStatus(room.status);
    setDescription(room.description || "");
    setRules(room.rules || "");
    setPublicContactName(room.publicContactName || "");
    setPublicContactPhone(room.publicContactPhone || "");
    // Extract amenityIds from the nested amenities array returned by API
    const ids = room.amenities?.map((ra) => ra.amenityId) || [];
    setAmenityIds(ids);
    setImages(room.images || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !area || !maxOccupants) return;
    setIsSubmitting(true);

    try {
      const token = getStoredAccessToken();
      const payload = {
        propertyId,
        name,
        price: Number(price),
        area: Number(area),
        maxOccupants: Number(maxOccupants),
        status,
        description,
        rules,
        publicContactName,
        publicContactPhone,
        amenityIds: amenityIds.length > 0 ? amenityIds : undefined,
      };

      if (editingRoom) {
        await apiRequest(`/rooms/${editingRoom.id}`, {
          method: "PUT",
          body: payload,
          token
        });
      } else {
        await apiRequest("/rooms", {
          method: "POST",
          body: payload,
          token
        });
      }
      
      setIsModalOpen(false);
      fetchData(); // Reload data
    } catch (error: any) {
      toast.error("Lỗi lưu dữ liệu: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng trọ này không?")) {
      try {
        const token = getStoredAccessToken();
        await apiRequest(`/rooms/${id}`, {
          method: "DELETE",
          token
        });
        setRooms(rooms.filter((r) => r.id !== id));
      } catch (error: any) {
        toast.error("Lỗi xóa dữ liệu: " + error.message);
      }
    }
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  const filteredRooms =
    selectedPropertyId === "all"
      ? rooms
      : rooms.filter((r) => r.propertyId === selectedPropertyId);

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + " triệu/tháng";
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý danh sách phòng trọ</h2>
        <Button onClick={handleOpenCreateModal}>
          ➕ Thêm phòng trọ mới
        </Button>
      </div>

      <div className={styles.controls}>
        <div>
          <span style={{ marginRight: "12px", fontWeight: 500 }}>Lọc theo khu trọ:</span>
          <select
            className={styles.filterSelect}
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          >
            <option value="all">Tất cả khu trọ</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredRooms.map((room) => {
          let statusText = translateStatus(room.status, ROOM_STATUS_MAP);
          let badgeClass = styles.statusAvailable;

          if (room.status === "RENTED") {
            badgeClass = styles.statusRented;
          } else if (room.status === "MAINTENANCE" || room.status === "DEPOSITED" || room.status === "HIDDEN") {
            badgeClass = styles.statusMaintenance;
          }

          return (
            <div key={room.id} className={styles.card}>
              <div className={styles.imageContainer}>
                {room.images && room.images.length > 0 ? (
                  <div style={{ backgroundImage: "url('https://placehold.co/400x200?text=Room+Image')", backgroundSize: "cover", backgroundPosition: "center", width: "100%", height: "100%" }}></div>
                ) : "🏠"}
                <span className={`${styles.statusBadge} ${badgeClass}`}>
                  {statusText}
                </span>
              </div>
              <div className={styles.cardContent}>
                <div>
                  <h3 className={styles.roomName}>{room.name}</h3>
                  <p className={styles.propertyName}>🏬 Khu: {room.property?.name || room.propertyName || "Không xác định"}</p>
                  <div className={styles.specs}>
                    <span>📐 {room.area} m²</span>
                    <span>👥 Tối đa: {room.maxOccupants} người</span>
                  </div>
                  <p className={styles.price}>{formatCurrency(room.price)}</p>
                </div>
                <div className={styles.cardFooter}>
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenEditModal(room)}
                    style={{ height: "32px", padding: "0 12px", fontSize: "13px" }}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(room.id)}
                    style={{ color: "var(--color-error)" }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingRoom ? "Chỉnh sửa phòng trọ" : "Thêm phòng trọ mới"}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Thuộc khu trọ *</label>
                    <select
                      className={styles.select}
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên phòng *</label>
                    <Input
                      placeholder="VD: Phòng 101"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Giá thuê (VND/tháng) *</label>
                    <Input
                      type="number"
                      placeholder="VD: 2500000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Diện tích (m²) *</label>
                    <Input
                      type="number"
                      placeholder="VD: 20"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số người tối đa *</label>
                    <Input
                      type="number"
                      value={maxOccupants}
                      onChange={(e) => setMaxOccupants(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Trạng thái phòng *</label>
                    <select
                      className={styles.select}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Room["status"])}
                    >
                      <option value="AVAILABLE">{ROOM_STATUS_MAP["AVAILABLE"]}</option>
                      <option value="DEPOSITED">{ROOM_STATUS_MAP["DEPOSITED"]}</option>
                      <option value="RENTED">{ROOM_STATUS_MAP["RENTED"]}</option>
                      <option value="MAINTENANCE">{ROOM_STATUS_MAP["MAINTENANCE"]}</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Hình ảnh phòng (Mockup)</label>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "8px", overflowX: "auto" }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ width: "80px", height: "80px", backgroundColor: "#E6ECF6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                          <span style={{ fontSize: "12px", color: "var(--color-deep-blue)" }}>Ảnh {idx + 1}</span>
                          <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", width: "20px", height: "20px", border: "none", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setImages([...images, `https://mock.image/img-${Date.now()}.jpg`])} style={{ width: "80px", height: "80px", border: "1px dashed var(--border-gray)", borderRadius: "8px", background: "none", cursor: "pointer", color: "var(--text-light-gray)", fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        +
                      </button>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-medium-gray)", margin: 0 }}>* Bấm dấu + để giả lập tải ảnh lên.</p>
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Tiện ích phòng</label>
                    {allAmenities.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-medium-gray)' }}>Chưa có tiện ích nào trong hệ thống. Vui lòng liên hệ admin.</p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "8px" }}>
                        {allAmenities.map((am) => (
                          <label key={am.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", cursor: "pointer", minWidth: "120px" }}>
                            <input 
                              type="checkbox" 
                              checked={amenityIds.includes(am.id)}
                              onChange={(e) => {
                                if (e.target.checked) setAmenityIds([...amenityIds, am.id]);
                                else setAmenityIds(amenityIds.filter(id => id !== am.id));
                              }}
                            />
                            <span>{am.icon || '✨'} {am.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên người liên hệ</label>
                    <Input
                      value={publicContactName}
                      onChange={(e) => setPublicContactName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại liên hệ</label>
                    <Input
                      value={publicContactPhone}
                      onChange={(e) => setPublicContactPhone(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Mô tả phòng</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Nhập thông tin chi tiết về phòng, nội thất có sẵn..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Nội quy phòng trọ</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Quy định giờ giấc, đóng tiền phòng, vệ sinh chung..."
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu lại"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
