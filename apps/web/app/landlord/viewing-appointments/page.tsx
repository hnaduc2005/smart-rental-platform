"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./viewing-appointments.module.css";

interface Appointment {
  id: string;
  note?: string;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  scheduledAt: string;
  seeker?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  room?: {
    id: string;
    name: string;
    property?: {
      id: string;
      name: string;
    }
  };
}

export default function LandlordAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<Appointment[]>("/viewing-appointments/my", { token });
      setAppointments(data);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment["status"]) => {
    try {
      const token = getStoredAccessToken();
      await apiRequest(`/viewing-appointments/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      fetchData(); // Reload data
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const filteredAppointments =
    filterStatus === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filterStatus);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return <span className={`${styles.badge} ${styles.badgeRequested}`}>Chờ xác nhận</span>;
      case "CONFIRMED":
        return <span className={`${styles.badge} ${styles.badgeConfirmed}`}>Đã chốt lịch</span>;
      case "CANCELLED":
        return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Đã hủy</span>;
      case "COMPLETED":
        return <span className={`${styles.badge} ${styles.badgeCompleted}`}>Đã xem phòng</span>;
      case "NO_SHOW":
        return <span className={`${styles.badge} ${styles.badgeNoShow}`}>Khách không đến</span>;
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
        <h2 className={styles.title}>Lịch hẹn xem phòng</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="REQUESTED">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã chốt lịch</option>
          <option value="COMPLETED">Đã xem xong</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredAppointments.map((apt) => (
          <div key={apt.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.seekerInfo}>
                <h3 className={styles.seekerName}>👤 {apt.seeker?.fullName || "Không rõ"}</h3>
                <p className={styles.seekerContact}>📞 {apt.seeker?.phone || "N/A"}</p>
              </div>
              {getStatusBadge(apt.status)}
            </div>

            <div className={styles.roomInfo}>
              <h4 className={styles.roomName}>{apt.room?.name || "Phòng không xác định"}</h4>
              <p className={styles.propertyName}>{apt.room?.property?.name || "Khu không xác định"}</p>
            </div>

            <div className={styles.appointmentTime}>
              🕒 {formatDate(apt.scheduledAt)}
            </div>

            {apt.note && (
              <div className={styles.note}>
                "{apt.note}"
              </div>
            )}

            <div className={styles.actions}>
              {apt.status === "REQUESTED" && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                    onClick={() => handleStatusChange(apt.id, "CONFIRMED")}
                  >
                    Xác nhận lịch
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                  >
                    Từ chối
                  </button>
                </>
              )}

              {apt.status === "CONFIRMED" && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.completeBtn}`}
                    onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                  >
                    Đã xem phòng
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.noShowBtn}`}
                    onClick={() => handleStatusChange(apt.id, "NO_SHOW")}
                  >
                    Khách không đến
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredAppointments.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)" }}>Không có lịch hẹn nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}
