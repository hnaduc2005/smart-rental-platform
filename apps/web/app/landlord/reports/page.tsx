"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./reports.module.css";

interface IssueReport {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  createdAt: string;
  contract?: {
    room?: { name: string; property?: { name: string } };
    tenantProfile?: { user?: { fullName: string } };
  };
}

export default function LandlordReportsPage() {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<IssueReport[]>("/issue-reports/my", { token });
      setReports(data);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu sự cố: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: IssueReport["status"]) => {
    try {
      const token = getStoredAccessToken();
      await apiRequest(`/issue-reports/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      fetchData();
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const filteredReports =
    filterStatus === "ALL"
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ xử lý</span>;
      case "IN_PROGRESS":
        return <span className={`${styles.badge} ${styles.badgeInProgress}`}>Đang sửa chữa</span>;
      case "RESOLVED":
        return <span className={`${styles.badge} ${styles.badgeResolved}`}>Đã khắc phục</span>;
      case "CLOSED":
        return <span className={`${styles.badge} ${styles.badgeClosed}`}>Đã đóng</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <span className={`${styles.badge} ${styles.priorityHigh}`}>Khẩn cấp</span>;
      case "MEDIUM":
        return <span className={`${styles.badge} ${styles.priorityMedium}`}>Bình thường</span>;
      case "LOW":
        return <span className={`${styles.badge} ${styles.priorityLow}`}>Thấp</span>;
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
        <h2 className={styles.title}>Quản lý sự cố</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Chờ xử lý</option>
          <option value="IN_PROGRESS">Đang sửa chữa</option>
          <option value="RESOLVED">Đã khắc phục</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredReports.map((report) => (
          <div key={report.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.issueTitle}>{report.title}</h3>
                <p className={styles.roomInfo}>
                  🏠 {report.contract?.room?.name || "Không rõ"} - {report.contract?.room?.property?.name || "Khu không rõ"}
                </p>
                <p className={styles.dateInfo}>
                  👤 Khách: {report.contract?.tenantProfile?.user?.fullName || "Không rõ"}
                  <br />
                  📅 Gửi lúc: {formatDate(report.createdAt)}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                {getStatusBadge(report.status)}
                {getPriorityBadge(report.priority)}
              </div>
            </div>

            <div className={styles.description}>
              <strong>Mô tả:</strong> {report.description}
            </div>

            <div className={styles.actions}>
              {report.status === "OPEN" && (
                <button
                  className={`${styles.actionBtn} ${styles.progressBtn}`}
                  onClick={() => handleStatusChange(report.id, "IN_PROGRESS")}
                >
                  Đang xử lý
                </button>
              )}
              {report.status === "IN_PROGRESS" && (
                <button
                  className={`${styles.actionBtn} ${styles.resolveBtn}`}
                  onClick={() => handleStatusChange(report.id, "RESOLVED")}
                >
                  Đã khắc phục xong
                </button>
              )}
              <button className={`${styles.actionBtn} ${styles.viewBtn}`}>
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)" }}>Không có sự cố nào.</p>
        )}
      </div>
    </div>
  );
}
