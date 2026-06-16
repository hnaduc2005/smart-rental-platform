"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./rental-requests.module.css";

interface RentalRequest {
  id: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  seeker?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
    property?: {
      id: string;
      name: string;
    }
  };
}

export default function LandlordRentalRequestsPage() {
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<RentalRequest[]>("/rental-requests/my", { token });
      setRequests(data);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: RentalRequest["status"]) => {
    if (newStatus === "APPROVED") {
      if (!confirm("Sau khi duyệt, người thuê có thể tiến hành đặt cọc và làm hợp đồng. Bạn có chắc chắn muốn duyệt?")) return;
    }

    try {
      const token = getStoredAccessToken();
      await apiRequest(`/rental-requests/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      fetchData(); // Reload data
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + " tr";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ duyệt</span>;
      case "APPROVED":
        return <span className={`${styles.badge} ${styles.badgeApproved}`}>Đã duyệt</span>;
      case "REJECTED":
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>Đã từ chối</span>;
      case "CANCELLED":
        return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Khách hủy</span>;
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
        <h2 className={styles.title}>Đơn xin thuê phòng</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredRequests.map((req) => (
          <div key={req.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.seekerInfo}>
                <h3 className={styles.seekerName}>👤 {req.seeker?.fullName || "Không rõ"}</h3>
                <p className={styles.seekerContact}>📞 {req.seeker?.phone || "N/A"} • ✉️ {req.seeker?.email || "N/A"}</p>
              </div>
              {getStatusBadge(req.status)}
            </div>

            <div className={styles.roomInfo}>
              <div className={styles.roomDetails}>
                <h4>{req.room?.name || "Phòng không xác định"}</h4>
                <p>{req.room?.property?.name || "Khu không xác định"}</p>
              </div>
              <div className={styles.roomPrice}>
                {req.room?.price ? formatCurrency(req.room.price) + "/tháng" : "Chưa có giá"}
              </div>
            </div>

            {req.message && (
              <div className={styles.messageBox}>
                <strong>Lời nhắn:</strong> "{req.message}"
              </div>
            )}

            <span className={styles.requestDate}>
              Gửi lúc: {formatDate(req.createdAt)}
            </span>

            <div className={styles.actions}>
              {req.status === "PENDING" && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                    onClick={() => handleStatusChange(req.id, "APPROVED")}
                  >
                    ✓ Duyệt cho thuê
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    onClick={() => handleStatusChange(req.id, "REJECTED")}
                  >
                    ✕ Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)" }}>Không có yêu cầu thuê nào.</p>
        )}
      </div>
    </div>
  );
}
