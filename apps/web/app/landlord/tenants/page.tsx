"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./tenants.module.css";

export default function LandlordTenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<any[]>("/tenants/my", { token });
      setTenants(data);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu khách thuê: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const fullName = t.user?.fullName || "";
    const phone = t.user?.phone || "";
    const latestContract = t.contracts && t.contracts.length > 0 ? t.contracts[0] : null;
    const roomName = latestContract?.room?.name || "";
    
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      roomName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  const handleEditInfoClick = () => {
    alert("Tính năng đang phát triển. Khách thuê có thể tự cập nhật thông tin cá nhân trên ứng dụng di động để đảm bảo bảo mật.");
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyMessage.trim()) return;
    alert(`Đã gửi thông báo đến ${selectedTenant?.user?.fullName || "khách thuê"} thành công!`);
    setIsNotifyModalOpen(false);
    setNotifyMessage("");
    setSelectedTenant(null);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý khách thuê</h2>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm kiếm tên, SĐT, hoặc phòng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {filteredTenants.map((tenant) => {
          const fullName = tenant.user?.fullName || "Khách chưa cập nhật tên";
          const phone = tenant.user?.phone;
          const identityNumber = tenant.identityNumber;
          const latestContract = tenant.contracts && tenant.contracts.length > 0 ? tenant.contracts[0] : null;
          const isMainTenant = latestContract ? true : false;
          const roomName = latestContract?.room?.name || "Chưa có phòng";
          const propertyName = latestContract?.room?.property?.name || "Chưa có khu";
          const joinDate = latestContract?.startDate;

          return (
            <div key={tenant.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {getInitials(fullName)}
                </div>
                <div className={styles.tenantInfo}>
                  <h3>{fullName}</h3>
                  {isMainTenant ? (
                    <span className={`${styles.badge} ${styles.badgeMain}`}>Người đại diện HĐ</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeCoTenant}`}>Người ở ghép</span>
                  )}
                </div>
              </div>

              <div className={styles.roomTag}>
                🏠 {roomName} - {propertyName}
              </div>

              <div className={styles.details}>
                <div className={styles.detailItem}>
                  <span className={styles.icon}>📞</span>
                  <span>{phone || "Chưa cập nhật"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.icon}>🪪</span>
                  <span>{identityNumber || "Chưa cập nhật"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.icon}>📅</span>
                  <span>Vào ở từ: {joinDate ? formatDate(joinDate) : "Không rõ"}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={handleEditInfoClick}>
                  Sửa thông tin
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setIsNotifyModalOpen(true);
                  }}
                >
                  Gửi thông báo
                </button>
              </div>
            </div>
          );
        })}
        {filteredTenants.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)" }}>Không tìm thấy khách thuê phù hợp.</p>
        )}
      </div>

      {isNotifyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsNotifyModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Gửi thông báo cho {selectedTenant?.user?.fullName || "Khách thuê"}</h3>
              <button className={styles.closeBtn} onClick={() => setIsNotifyModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSendNotification}>
              <div className={styles.modalBody}>
                <div style={{ marginBottom: 16 }}>
                  <label className={styles.label}>Nội dung thông báo *</label>
                  <textarea 
                    className={styles.textarea} 
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    placeholder="Nhập nội dung cần gửi..."
                    required
                  />
                </div>
              </div>
              <div className={styles.modalFooter} style={{ padding: "16px", display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eaeaea" }}>
                <button 
                  type="button" 
                  className={`${styles.actionBtn}`} 
                  onClick={() => setIsNotifyModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={`${styles.actionBtn} ${styles.activateBtn}`}
                  style={{ backgroundColor: "var(--primary-blue)", color: "white" }}
                >
                  Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
