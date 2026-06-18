"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./page.module.css";

export default function TenantInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<any[]>("/invoices/tenant/my", { token });
      setInvoices(data);
    } catch (err: any) {
      alert("Lỗi tải hóa đơn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'unpaid':
        return <Badge variant="warning">Chưa thanh toán</Badge>;
      case 'PAID':
      case 'paid':
        return <Badge variant="success">Đã thanh toán</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge variant="info">Thanh toán một phần</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">Đang xử lý</Badge>;
      case 'OVERDUE':
      case 'overdue':
        return <Badge variant="error">Quá hạn</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Hóa đơn của bạn</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu hóa đơn...</p>
      ) : invoices.length === 0 ? (
        <p>Chưa có hóa đơn nào.</p>
      ) : (
      <div className={styles.invoiceList}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className={styles.invoiceCard}>
            {/* Header */}
            <div className={styles.invoiceHeader}>
              <h2 className={styles.invoiceTitle}>
                Hóa đơn tháng {new Date(invoice.billingMonth).getMonth() + 1}/{new Date(invoice.billingMonth).getFullYear()}
              </h2>
              <div className={styles.invoiceStatus}>
                <span className={styles.dueDate}>Hạn chót: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</span>
                {renderStatusBadge(invoice.status)}
              </div>
            </div>

            {/* Body */}
            <div className={styles.invoiceBody}>
              <div className={styles.breakdownSection}>
                {/* Tiền phòng */}
                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Tiền phòng</span>
                    <span className={styles.itemTotal}>
                      {Number(invoice.roomAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Tiền điện</span>
                    <span className={styles.itemTotal}>
                      {Number(invoice.electricAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Tiền nước</span>
                    <span className={styles.itemTotal}>
                      {Number(invoice.waterAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Dịch vụ khác</span>
                    <span className={styles.itemTotal}>
                      {Number(invoice.serviceAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className={styles.summarySection}>
                <div>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Tổng thanh toán</span>
                    <span className={styles.totalAmount}>
                      {Number(invoice.totalAmount).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  {invoice.status === 'PENDING' && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                      Vui lòng thanh toán đầy đủ trước ngày {new Date(invoice.dueDate).toLocaleDateString('vi-VN')} để không bị tính phí phạt.
                    </p>
                  )}
                </div>
                
                {invoice.status === 'PENDING' && (
                  <Link href={`/tenant/payments?invoiceId=${invoice.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <Button variant="cta" fullWidth>Thanh toán ngay</Button>
                  </Link>
                )}
                {invoice.status === 'PAID' && (
                  <div className={styles.actionButton}>
                    <Button variant="secondary" fullWidth disabled>Đã thanh toán</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
