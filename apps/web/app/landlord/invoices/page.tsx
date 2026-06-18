"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { Button, Input } from "@/components/common";
import styles from "./invoices.module.css";

interface Invoice {
  id: string;
  billingMonth: string; // ISO date
  dueDate: string;
  roomAmount: number;
  electricAmount: number;
  waterAmount: number;
  serviceAmount: number;
  totalAmount: number;
  status: "UNPAID" | "PAID" | "OVERDUE" | "CANCELLED" | "PENDING_CONFIRMATION" | "REJECTED";
  contract?: {
    code: string;
    room?: { name: string; property?: { name: string } };
    tenantProfile?: { user?: { fullName: string } };
  };
}

interface Contract {
  id: string;
  code: string;
  room?: { name: string; property?: { name: string } };
  tenantProfile?: { user?: { fullName: string } };
}

export default function LandlordInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [contractId, setContractId] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [roomAmount, setRoomAmount] = useState("");
  const [electricAmount, setElectricAmount] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [serviceAmount, setServiceAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [invoicesData, contractsData] = await Promise.all([
        apiRequest<Invoice[]>("/invoices/my", { token }),
        apiRequest<Contract[]>("/contracts/my", { token }) // fetch contracts
      ]);
      setInvoices(invoicesData);
      setContracts(contractsData);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Invoice["status"]) => {
    if (newStatus === "PAID") {
      if (!confirm("Xác nhận khách đã thanh toán hóa đơn này?")) return;
    }

    try {
      const token = getStoredAccessToken();
      await apiRequest(`/invoices/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
        token
      });
      if (newStatus === "PAID") {
        alert("Xác nhận thu tiền thành công!");
      }
      fetchData(); // Reload data
    } catch (error: any) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !billingMonth || !dueDate || !roomAmount) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/invoices", {
        method: "POST",
        body: {
          contractId,
          billingMonth: new Date(billingMonth).toISOString(),
          dueDate: new Date(dueDate).toISOString(),
          roomAmount: Number(roomAmount),
          electricAmount: Number(electricAmount) || 0,
          waterAmount: Number(waterAmount) || 0,
          serviceAmount: Number(serviceAmount) || 0,
        },
        token
      });
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert("Lỗi tạo hóa đơn: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (contracts.length === 0) {
      alert("Bạn cần tạo Hợp đồng trước khi lập Hóa đơn.");
      return;
    }
    setContractId(contracts[0].id);
    setBillingMonth("");
    setDueDate("");
    setRoomAmount("");
    setElectricAmount("");
    setWaterAmount("");
    setServiceAmount("");
    setIsModalOpen(true);
  };

  const filteredInvoices =
    filterStatus === "ALL"
      ? invoices
      : invoices.filter((i) => i.status === filterStatus);

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
  };

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
      case "UNPAID":
        return <span className={`${styles.badge} ${styles.badgeUnpaid}`}>Chưa thanh toán</span>;
      case "PAID":
        return <span className={`${styles.badge} ${styles.badgePaid}`}>Đã thanh toán</span>;
      case "OVERDUE":
        return <span className={`${styles.badge} ${styles.badgeOverdue}`}>Quá hạn</span>;
      case "CANCELLED":
        return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Đã hủy</span>;
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
        <h2 className={styles.title}>Quản lý hóa đơn</h2>
        <Button onClick={handleOpenCreateModal}>+ Tạo hóa đơn mới</Button>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="OVERDUE">Quá hạn</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.roomInfo}>
                <h3>{formatMonth(invoice.billingMonth)}</h3>
                <p>
                  {invoice.contract?.room?.name || "Không rõ"} - {invoice.contract?.room?.property?.name || "Khu không rõ"}
                  <br/>
                  <small style={{ color: "#666" }}>Đại diện: {invoice.contract?.tenantProfile?.user?.fullName || "Không rõ"}</small>
                </p>
              </div>
              {getStatusBadge(invoice.status)}
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Hạn thanh toán:</span>
                <span className={styles.detailValue}>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tiền phòng:</span>
                <span className={styles.detailValue}>{formatCurrency(invoice.roomAmount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tiền điện:</span>
                <span className={styles.detailValue}>{formatCurrency(invoice.electricAmount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tiền nước:</span>
                <span className={styles.detailValue}>{formatCurrency(invoice.waterAmount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Dịch vụ khác:</span>
                <span className={styles.detailValue}>{formatCurrency(invoice.serviceAmount)}</span>
              </div>
              
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng cộng:</span>
                <span className={styles.totalValue}>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>

            <div className={styles.actions}>
              {invoice.status === "UNPAID" && (
                <button
                  className={`${styles.actionBtn} ${styles.payBtn}`}
                  onClick={() => handleStatusChange(invoice.id, "PAID")}
                >
                  Xác nhận đã thu tiền
                </button>
              )}
              <button 
                className={`${styles.actionBtn} ${styles.viewBtn}`}
                onClick={() => handleViewDetails(invoice)}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
        {filteredInvoices.length === 0 && (
          <p style={{ color: "var(--text-medium-gray)", marginTop: 24 }}>Không có hóa đơn nào.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo hóa đơn mới</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroupFull} style={{ marginBottom: 16 }}>
                  <label className={styles.label}>Chọn Hợp đồng / Phòng *</label>
                  <select 
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    value={contractId} 
                    onChange={(e) => setContractId(e.target.value)}
                  >
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code || `HĐ-${c.id.slice(0, 6)}`} | {c.room?.name} - {c.room?.property?.name} ({c.tenantProfile?.user?.fullName})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <label className={styles.label}>Kỳ hóa đơn (Tháng) *</label>
                    <Input 
                      type="date" 
                      value={billingMonth} 
                      onChange={(e) => setBillingMonth(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Hạn thanh toán *</label>
                    <Input 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <label className={styles.label}>Tiền phòng *</label>
                    <Input 
                      type="number" 
                      value={roomAmount} 
                      onChange={(e) => setRoomAmount(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Tiền điện</label>
                    <Input 
                      type="number" 
                      value={electricAmount} 
                      onChange={(e) => setElectricAmount(e.target.value)} 
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <label className={styles.label}>Tiền nước</label>
                    <Input 
                      type="number" 
                      value={waterAmount} 
                      onChange={(e) => setWaterAmount(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Dịch vụ khác</label>
                    <Input 
                      type="number" 
                      value={serviceAmount} 
                      onChange={(e) => setServiceAmount(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter} style={{ padding: "16px", display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eaeaea" }}>
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

      {isDetailModalOpen && selectedInvoice && (
        <div className={styles.modalOverlay} onClick={() => setIsDetailModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Chi tiết hóa đơn {formatMonth(selectedInvoice.billingMonth)}</h3>
              <button className={styles.closeBtn} onClick={() => setIsDetailModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: 16 }}>
                <strong>Thông tin Hợp đồng:</strong> {selectedInvoice.contract?.code || `HĐ-${selectedInvoice.contract?.id?.slice(0, 6)}`}
                <br/>
                <strong>Phòng:</strong> {selectedInvoice.contract?.room?.name} - {selectedInvoice.contract?.room?.property?.name}
                <br/>
                <strong>Đại diện thuê:</strong> {selectedInvoice.contract?.tenantProfile?.user?.fullName}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 0" }}>Tiền phòng</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{formatCurrency(selectedInvoice.roomAmount)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 0" }}>Tiền điện</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{formatCurrency(selectedInvoice.electricAmount)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 0" }}>Tiền nước</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{formatCurrency(selectedInvoice.waterAmount)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 0" }}>Dịch vụ khác</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{formatCurrency(selectedInvoice.serviceAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 0", fontWeight: "bold", fontSize: 18 }}>Tổng cộng</td>
                    <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "bold", fontSize: 18, color: "var(--primary-blue)" }}>
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Trạng thái: {getStatusBadge(selectedInvoice.status)}</span>
                <span>Hạn đóng: <strong>{formatDate(selectedInvoice.dueDate)}</strong></span>
              </div>
            </div>
            <div className={styles.modalFooter} style={{ padding: "16px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #eaeaea" }}>
              <Button type="button" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
