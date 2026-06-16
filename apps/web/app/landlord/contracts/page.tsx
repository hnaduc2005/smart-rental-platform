"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { Button, Input } from "@/components/common";
import styles from "./contracts.module.css";

interface Room {
  id: string;
  name: string;
  property: { name: string };
}

interface Contract {
  id: string;
  code?: string;
  roomId: string;
  room?: Room;
  tenantProfileId: string;
  tenantProfile?: {
    user?: {
      fullName: string | null;
      phone: string | null;
    }
  };
  startDate: string;
  endDate?: string;
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  notes?: string;
  status: "DRAFT" | "ACTIVE" | "ENDED" | "TERMINATED" | "EXPIRED";
}

export default function LandlordContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [roomId, setRoomId] = useState("");
  const [tenantProfileId, setTenantProfileId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentDueDay, setPaymentDueDay] = useState("5");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [contractsData, roomsData] = await Promise.all([
        apiRequest<Contract[]>("/contracts/my", { token }),
        apiRequest<any[]>("/rooms/my", { token }) // fetch rooms to select
      ]);
      setContracts(contractsData);
      setRooms(roomsData);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Contract["status"]) => {
    if (newStatus === "ACTIVE") {
      if (!confirm("Khi kích hoạt hợp đồng, trạng thái phòng sẽ tự động chuyển sang Đã Thuê. Bạn chắc chắn chứ?")) return;
    } else if (newStatus === "ENDED") {
      if (!confirm("Bạn có chắc muốn thanh lý hợp đồng này?")) return;
    }

    try {
      const token = getStoredAccessToken();
      await apiRequest(`/contracts/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      fetchData(); // Reload data
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !tenantProfileId || !startDate || !rentAmount || !depositAmount || !paymentDueDay) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/contracts", {
        method: "POST",
        body: {
          roomId,
          tenantProfileId,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          rentAmount: Number(rentAmount),
          depositAmount: Number(depositAmount),
          paymentDueDay: Number(paymentDueDay),
          notes
        },
        token
      });
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert("Lỗi tạo hợp đồng: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (rooms.length === 0) {
      alert("Bạn cần phải có phòng trống trước khi tạo hợp đồng.");
      return;
    }
    setRoomId(rooms[0].id);
    setTenantProfileId("");
    setStartDate("");
    setEndDate("");
    setRentAmount("");
    setDepositAmount("");
    setPaymentDueDay("5");
    setNotes("");
    setIsModalOpen(true);
  };

  const filteredContracts =
    filterStatus === "ALL"
      ? contracts
      : contracts.filter((c) => c.status === filterStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className={`${styles.badge} ${styles.badgeDraft}`}>Bản nháp</span>;
      case "ACTIVE":
        return <span className={`${styles.badge} ${styles.badgeActive}`}>Đang hiệu lực</span>;
      case "ENDED":
        return <span className={`${styles.badge} ${styles.badgeEnded}`}>Đã kết thúc</span>;
      case "TERMINATED":
        return <span className={`${styles.badge} ${styles.badgeTerminated}`}>Hủy trước hạn</span>;
      case "EXPIRED":
        return <span className={`${styles.badge} ${styles.badgeExpired}`}>Hết hạn</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý hợp đồng</h2>
        <Button onClick={handleOpenCreateModal}>+ Soạn hợp đồng mới</Button>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ACTIVE">Đang hiệu lực</option>
          <option value="ENDED">Đã kết thúc</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredContracts.map((contract) => (
          <div key={contract.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.roomInfo}>
                <h3>{contract.code || `HĐ-${contract.id.slice(0, 6)}`}</h3>
                <p>{contract.room?.name || "Phòng không xác định"} - {contract.room?.property?.name || "Khu không xác định"}</p>
              </div>
              {getStatusBadge(contract.status)}
            </div>

            <div className={styles.tenantInfo}>
              <h4 className={styles.tenantName}>👤 Người đại diện: {contract.tenantProfile?.user?.fullName || "Không rõ"}</h4>
              <p className={styles.tenantContact}>📞 {contract.tenantProfile?.user?.phone || "Không rõ"}</p>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Thời hạn:</span>
                <span className={styles.detailValue}>
                  {formatDate(contract.startDate)} - {contract.endDate ? formatDate(contract.endDate) : "Vô thời hạn"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giá thuê:</span>
                <span className={`${styles.detailValue} ${styles.highlightValue}`}>
                  {formatCurrency(contract.rentAmount)}/tháng
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tiền cọc:</span>
                <span className={styles.detailValue}>
                  {formatCurrency(contract.depositAmount)}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              {contract.status === "DRAFT" && (
                <button
                  className={`${styles.actionBtn} ${styles.activateBtn}`}
                  onClick={() => handleStatusChange(contract.id, "ACTIVE")}
                >
                  Kích hoạt hợp đồng
                </button>
              )}
              {contract.status === "ACTIVE" && (
                <button
                  className={`${styles.actionBtn} ${styles.endBtn}`}
                  onClick={() => handleStatusChange(contract.id, "ENDED")}
                >
                  Thanh lý HĐ
                </button>
              )}
              <button className={`${styles.actionBtn} ${styles.viewBtn}`}>
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
        {filteredContracts.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)", marginTop: 24 }}>Không có hợp đồng nào.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Thêm hợp đồng mới</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Chọn Phòng *</label>
                  <select 
                    className={styles.select} 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)}
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.property?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>ID Hồ sơ người thuê (TenantProfile ID) *</label>
                  <Input 
                    value={tenantProfileId} 
                    onChange={(e) => setTenantProfileId(e.target.value)} 
                    placeholder="VD: clx..." 
                    required 
                  />
                  <small style={{ color: "var(--text-light-gray)" }}>
                    Lưu ý: Bạn phải lấy ID này từ cơ sở dữ liệu bảng TenantProfile.
                  </small>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày bắt đầu *</label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày kết thúc</label>
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tiền thuê hàng tháng *</label>
                    <Input 
                      type="number" 
                      value={rentAmount} 
                      onChange={(e) => setRentAmount(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tiền cọc *</label>
                    <Input 
                      type="number" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày đóng tiền hàng tháng *</label>
                    <Input 
                      type="number" 
                      value={paymentDueDay} 
                      onChange={(e) => setPaymentDueDay(e.target.value)} 
                      required 
                      min="1" max="31"
                    />
                  </div>
                </div>
                <div className={styles.formGroupFull} style={{ marginTop: 16 }}>
                  <label className={styles.label}>Ghi chú</label>
                  <textarea 
                    className={styles.textarea} 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
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
