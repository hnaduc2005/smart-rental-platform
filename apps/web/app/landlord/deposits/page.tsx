"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./deposits.module.css";
import { toast } from "react-hot-toast";

interface Deposit {
  id: string;
  roomName: string;
  source: string; // From Request or Contract
  amount: number;
  status: "PENDING_CONFIRMATION" | "PAID" | "REFUNDED" | "FORFEITED" | "REJECTED";
  proofImageUrl?: string;
  createdAt: string;
}

// Fetched dynamically from API

export default function LandlordDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<any[]>("/deposits/my", { token });
      
      const mappedData: Deposit[] = data.map((d: any) => {
        const roomName = d.contract?.room?.name || d.rentalRequest?.room?.name || "Không xác định";
        const source = d.contract 
          ? `Hợp đồng ${d.contract.code || d.contract.id.slice(0, 8)}`
          : d.rentalRequest 
            ? `Đơn xin thuê (${d.rentalRequest.seeker?.fullName || "Khách"})`
            : "Không xác định";

        return {
          id: d.id,
          roomName,
          source,
          amount: Number(d.amount),
          status: d.status,
          proofImageUrl: d.proofImageUrl,
          createdAt: d.createdAt,
        };
      });
      
      setDeposits(mappedData);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu tiền cọc: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Deposit["status"]) => {
    if (newStatus === "PAID") {
      if (!confirm("Bạn xác nhận đã nhận được khoản tiền cọc này?")) return;
    }

    try {
      const token = getStoredAccessToken();
      await apiRequest(`/deposits/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      fetchData(); // Reload
    } catch (error: any) {
      toast.error("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const filteredDeposits =
    filterStatus === "ALL"
      ? deposits
      : deposits.filter((d) => d.status === filterStatus);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      case "PENDING_CONFIRMATION":
        return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ xác nhận</span>;
      case "PAID":
        return <span className={`${styles.badge} ${styles.badgePaid}`}>Đã nhận</span>;
      case "REFUNDED":
        return <span className={`${styles.badge} ${styles.badgeRefunded}`}>Đã hoàn tiền</span>;
      case "FORFEITED":
        return <span className={`${styles.badge} ${styles.badgeForfeited}`}>Mất cọc</span>;
      case "REJECTED":
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>Từ chối</span>;
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
        <h2 className={styles.title}>Quản lý tiền cọc</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
          <option value="PAID">Đã nhận</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Phòng</th>
              <th>Nguồn / Người chuyển</th>
              <th>Số tiền</th>
              <th>Minh chứng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.map((dep) => (
              <tr key={dep.id}>
                <td>{formatDate(dep.createdAt)}</td>
                <td>{dep.roomName}</td>
                <td>{dep.source}</td>
                <td className={styles.amount}>{formatCurrency(dep.amount)}</td>
                <td>
                  {dep.proofImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={dep.proofImageUrl} 
                      alt="Minh chứng" 
                      className={styles.imagePreview} 
                      onClick={() => window.open(dep.proofImageUrl, "_blank")}
                    />
                  ) : (
                    <span className={styles.noImage}>Không có</span>
                  )}
                </td>
                <td>{getStatusBadge(dep.status)}</td>
                <td>
                  <div className={styles.actions}>
                    {dep.status === "PENDING_CONFIRMATION" && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.confirmBtn}`}
                          onClick={() => handleStatusChange(dep.id, "PAID")}
                        >
                          Đã nhận
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          onClick={() => handleStatusChange(dep.id, "REJECTED")}
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {dep.status !== "PENDING_CONFIRMATION" && (
                      <button className={`${styles.actionBtn} ${styles.viewBtn}`}>
                        Chi tiết
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredDeposits.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--text-medium-gray)", padding: "24px" }}>
                  Không có giao dịch cọc nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
