"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./page.module.css";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const initialInvoiceId = searchParams?.get("invoiceId") || "";

  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: initialInvoiceId,
    proofImageUrl: "" 
  });
  const [previewName, setPreviewName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [invData, payData] = await Promise.all([
        apiRequest<any[]>("/invoices/tenant/my", { token }),
        apiRequest<any[]>("/payments/tenant/my", { token })
      ]);
      setInvoices(invData);
      setPayments(payData);
    } catch (err: any) {
      alert("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    setPreviewName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setFormData({ ...formData, proofImageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId) {
      alert("Vui lòng chọn hóa đơn cần thanh toán!");
      return;
    }
    if (!formData.proofImageUrl) {
      alert("Vui lòng tải lên hình ảnh biên lai!");
      return;
    }

    const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);
    if (!selectedInvoice) return;

    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/payments", {
        method: "POST",
        body: {
          invoiceId: selectedInvoice.id,
          amount: Number(selectedInvoice.totalAmount),
          proofImageUrl: formData.proofImageUrl
        },
        token
      });
      alert("Gửi xác nhận thanh toán thành công!");
      setFormData({ invoiceId: "", proofImageUrl: "" });
      setPreviewName("");
      fetchData(); // reload
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID');
  const selectedInvoiceData = invoices.find(inv => inv.id === formData.invoiceId);
  const landlordBankInfo = selectedInvoiceData?.contract?.landlord || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Chờ xác nhận</Badge>;
      case 'CONFIRMED': return <Badge variant="success">Đã xác nhận</Badge>;
      case 'REJECTED': return <Badge variant="error">Bị từ chối</Badge>;
      case 'CANCELLED': return <Badge variant="error">Đã hủy</Badge>;
      default: return null;
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Quản lý thanh toán</h1>

      <div className={styles.grid}>
        {/* Left Column: Form Upload */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Gửi minh chứng thanh toán</h2>

            <div className={styles.bankInfo}>
              {formData.invoiceId && landlordBankInfo ? (
                <>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Ngân hàng:</span>
                    <span className={styles.bankValue}>{landlordBankInfo.bankName || <span style={{color: 'red'}}>Chưa cập nhật</span>}</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Số tài khoản:</span>
                    <span className={styles.bankValue}>{landlordBankInfo.bankAccountNumber || <span style={{color: 'red'}}>Chưa cập nhật</span>}</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Chủ tài khoản:</span>
                    <span className={styles.bankValue}>{landlordBankInfo.bankAccountName || <span style={{color: 'red'}}>Chưa cập nhật</span>}</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-medium-gray)' }}>
                  Vui lòng chọn một hóa đơn bên dưới để xem thông tin thanh toán của Chủ trọ.
                </div>
              )}
            </div>

            <form className={styles.uploadForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Chọn hóa đơn cần thanh toán</label>
                <select 
                  className={styles.select}
                  value={formData.invoiceId}
                  onChange={e => setFormData({...formData, invoiceId: e.target.value})}
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      Hóa đơn tháng {new Date(inv.billingMonth).getMonth() + 1} - {Number(inv.totalAmount).toLocaleString("vi-VN")} ₫
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Hình ảnh minh chứng / Biên lai</label>
                <label className={styles.uploadBox} htmlFor="payment-proof-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <input
                    id="payment-proof-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {formData.proofImageUrl ? (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img src={formData.proofImageUrl} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                        Bấm để thay đổi
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={styles.uploadIcon}>📸</span>
                      <span className={styles.uploadText}>
                        Bấm vào đây để tải ảnh lên<br />(Hỗ trợ JPG, PNG, tối đa 2MB)
                      </span>
                    </>
                  )}
                </label>
                {previewName && !formData.proofImageUrl && <div style={{marginTop: 8, fontSize: 14, color: 'green'}}>Đã chọn: {previewName}</div>}
              </div>

              <div style={{ marginTop: "8px" }}>
                <Button variant="primary" fullWidth disabled={isSubmitting || !formData.invoiceId || !formData.proofImageUrl}>
                  {isSubmitting ? "Đang gửi..." : "Gửi xác nhận thanh toán"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Lịch sử giao dịch */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lịch sử giao dịch</h2>

            <div className={styles.historyList}>
              {payments.length === 0 ? (
                <p>Chưa có giao dịch nào.</p>
              ) : payments.map((payment) => (
                <div key={payment.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyId}>Mã GD: {payment.id.slice(-8)}</span>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                      Thanh toán cho: Hóa đơn tháng {new Date(payment.invoice.billingMonth).getMonth() + 1}
                    </span>
                    <div className={styles.historyMeta}>
                      <span>⏱ {new Date(payment.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.historyAmount}>
                      {Number(payment.amount).toLocaleString("vi-VN")} ₫
                    </span>
                    {getStatusBadge(payment.status)}
                    {payment.proofImageUrl && (
                      <a href={payment.proofImageUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--primary-blue)", cursor: "pointer", textDecoration: "underline" }}>
                        Xem ảnh biên lai
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TenantPaymentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
