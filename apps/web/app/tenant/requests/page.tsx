"use client";

import React, { useState, useEffect } from "react";
import { Badge, Button, Input } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { RENTAL_REQUEST_STATUS_MAP, translateStatus } from "@/lib/status-translators";
import { toast } from "react-hot-toast";
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

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openDepositModal = (reqId: string) => {
    setSelectedRequestId(reqId);
    setDepositAmount("");
    setProofImageUrl("");
    setIsDepositModalOpen(true);
  };

  const handleSubmitDeposit = async () => {
    if (!depositAmount || !proofImageUrl) {
      toast.error("Vui lòng nhập đầy đủ số tiền và đường dẫn ảnh minh chứng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/deposits", {
        method: "POST",
        token,
        body: {
          rentalRequestId: selectedRequestId,
          amount: Number(depositAmount),
          proofImageUrl
        }
      });
      toast.success("Đã gửi thông tin tiền cọc thành công! Vui lòng chờ xác nhận.");
      setIsDepositModalOpen(false);
      fetchData(); // Reload list to see if any status changed (though it will be pending confirmation on landlord side)
    } catch (err: any) {
      toast.error("Lỗi khi gửi tiền cọc: " + err.message);
    } finally {
      setIsSubmitting(false);
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

              {/* Action */}
              {req.status === "PENDING" && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px', textAlign: 'right' }}>
                  <Button onClick={() => openDepositModal(req.id)}>
                    Gửi biên lai cọc giữ chỗ
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px',
            width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ margin: 0 }}>Gửi tiền cọc giữ chỗ</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Vui lòng nhập số tiền bạn đã chuyển và đường dẫn (URL) ảnh chụp màn hình biên lai.
            </p>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Số tiền (VNĐ) *</label>
              <Input 
                type="number" 
                placeholder="VD: 1000000" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Link ảnh biên lai *</label>
              <Input 
                type="text" 
                placeholder="https://..." 
                value={proofImageUrl} 
                onChange={(e) => setProofImageUrl(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setIsDepositModalOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button onClick={handleSubmitDeposit} disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Xác nhận gửi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
