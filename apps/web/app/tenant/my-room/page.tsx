"use client";

import React, { useState, useEffect } from "react";
import { Badge, Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { CONTRACT_STATUS_MAP, translateStatus } from "@/lib/status-translators";
import styles from "./page.module.css";
import { toast } from "react-hot-toast";

export default function TenantMyRoomPage() {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<any[]>("/contracts/tenant/my", { token });
      // Get the first active or draft contract
      if (data && data.length > 0) {
        setContract(data[0]);
      }
    } catch (err: any) {
      toast.error("Lỗi tải thông tin phòng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  if (!contract) return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Phòng của tôi</h1>
      <p>Bạn hiện chưa thuê phòng nào hoặc chưa có hợp đồng.</p>
    </div>
  );

  const room = contract.room;
  const landlord = contract.landlord;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Phòng của tôi</h1>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.mainContent}>
          {/* Room Summary Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Thông tin phòng</h2>
            <div className={styles.roomInfo}>
              <div className={styles.roomImageWrapper}>
                <img
                  src={room.images?.[0]?.url || "https://placehold.co/160x120?text=No+Image"}
                  alt={room.name}
                  width={160}
                  height={120}
                  className={styles.roomImage}
                />
              </div>
              <div className={styles.roomDetails}>
                <h3 className={styles.roomName}>{room.name}</h3>
                <p className={styles.roomAddress}>{room.property?.name}</p>
                <p className={styles.roomPrice}>
                  {Number(contract.rentAmount).toLocaleString("vi-VN")} ₫ / tháng
                </p>
                <div className={styles.actionButtons}>
                  <Button variant="secondary">Xem bài đăng</Button>
                  <Button variant="primary">Liên hệ</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Chi tiết hợp đồng</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Mã hợp đồng</span>
              <span className={styles.infoValue}>{contract.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày bắt đầu</span>
              <span className={styles.infoValue}>{new Date(contract.startDate).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày kết thúc (Dự kiến)</span>
              <span className={styles.infoValue}>{contract.endDate ? new Date(contract.endDate).toLocaleDateString("vi-VN") : "Không thời hạn"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Tiền cọc</span>
              <span className={styles.infoValue}>
                {Number(contract.depositAmount).toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Trạng thái</span>
              <Badge variant="success">{translateStatus(contract.status, CONTRACT_STATUS_MAP)}</Badge>
            </div>
          </div>

          {/* Room Rules Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Nội quy phòng trọ</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{contract.notes || "Không có ghi chú hoặc nội quy cụ thể trong hợp đồng."}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.sidebar}>
          {/* Roommates Card (Hiding for now as there is no specific table in Prisma) */}
          {/* <div className={styles.card}>
            <h2 className={styles.cardTitle}>Người ở cùng</h2>
          </div> */}

          {/* Landlord Card */}
          {landlord && landlord.user && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin chủ trọ</h2>
              <div className={styles.roommateItem} style={{ borderBottom: "none", paddingBottom: 0 }}>
                <div className={styles.avatar} style={{ background: "rgba(255, 92, 0, 0.1)", color: "var(--accent-orange)" }}>
                  {landlord.user.fullName.charAt(0)}
                </div>
                <div className={styles.roommateInfo}>
                  <p className={styles.roommateName}>{landlord.user.fullName}</p>
                  <p className={styles.roommateRole}>Chủ nhà</p>
                </div>
              </div>
              <div style={{ marginTop: "16px" }}>
                <Button variant="primary" style={{ width: "100%", justifyContent: "center" }}>
                  Gọi: {landlord.user.phone || "Không có SĐT"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
