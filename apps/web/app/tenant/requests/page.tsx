"use client";

import React, { useState, useEffect } from "react";
import { Badge, Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { RENTAL_REQUEST_STATUS_MAP, translateStatus } from "@/lib/status-translators";
import styles from "./page.module.css";

const statusVariantMap: Record<string, "warning" | "success" | "error" | "info"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "error",
};

export default function TenantRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const reqData = await apiRequest<any[]>("/rental-requests/seeker/my", { token });
      setRequests(reqData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Lịch sử yêu cầu</h1>

      <div className={styles.requestList}>
        {requests.length === 0 && <p style={{ color: 'var(--text-medium-gray)' }}>Không có yêu cầu nào.</p>}
        {requests.map((req) => (
          <div key={req.id} className={styles.requestCard}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <span className={styles.typeTag}>
                  📅 Yêu cầu thuê
                </span>
                <span className={styles.reqDate}>📅 {new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <Badge variant={statusVariantMap[req.status] || "info"}>
                {translateStatus(req.status, RENTAL_REQUEST_STATUS_MAP)}
              </Badge>
            </div>

            {/* Body */}
            <div className={styles.cardBody}>
              <div className={styles.roomInfo}>
                <h3 className={styles.roomTitle}>{req.room?.name}</h3>
                <p className={styles.roomAddress}>📍 {req.room?.property?.name}</p>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Chủ trọ</span>
                  <span className={styles.detailValue}>{req.room?.property?.landlord?.publicDisplayName || "Không rõ"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Số điện thoại</span>
                  <span className={styles.detailValue}>{req.room?.property?.landlord?.publicPhone || "Không rõ"}</span>
                </div>
                {req.message && (
                  <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                    <span className={styles.detailLabel}>Lời nhắn</span>
                    <span className={styles.detailValue} style={{ fontStyle: "italic" }}>{req.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
