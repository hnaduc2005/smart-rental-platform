import { Badge, Button } from "@/components/common";
import { mockPaymentsData, mockInvoicesData } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TenantPaymentsPage() {
  const unpaidInvoices = mockInvoicesData.filter(inv => inv.status === 'unpaid');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Chờ xác nhận</Badge>;
      case 'approved': return <Badge variant="success">Đã thanh toán</Badge>;
      case 'rejected': return <Badge variant="error">Bị từ chối</Badge>;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Quản lý thanh toán</h1>

      <div className={styles.grid}>
        {/* Left Column: Form Upload */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Gửi minh chứng thanh toán</h2>

            <div className={styles.bankInfo}>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Ngân hàng:</span>
                <span className={styles.bankValue}>Vietcombank (VCB)</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Số tài khoản:</span>
                <span className={styles.bankValue}>0123456789</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Chủ tài khoản:</span>
                <span className={styles.bankValue}>NGUYEN VAN CHU</span>
              </div>
            </div>

            <form className={styles.uploadForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Chọn hóa đơn cần thanh toán</label>
                <select className={styles.select}>
                  <option value="">-- Chọn hóa đơn --</option>
                  {unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      Hóa đơn {inv.month} - {inv.totalAmount.toLocaleString("vi-VN")} ₫
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Hình ảnh minh chứng / Biên lai</label>
                <label className={styles.uploadBox} htmlFor="payment-proof-upload" style={{ cursor: 'pointer' }}>
                  <input
                    id="payment-proof-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <span className={styles.uploadIcon}>📸</span>
                  <span className={styles.uploadText}>
                    Bấm vào đây để tải ảnh lên<br />(Hỗ trợ JPG, PNG)
                  </span>
                </label>
              </div>

              <div style={{ marginTop: "8px" }}>
                <Button variant="primary" fullWidth>Gửi xác nhận thanh toán</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Lịch sử giao dịch */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lịch sử giao dịch</h2>

            <div className={styles.historyList}>
              {mockPaymentsData.map((payment) => (
                <div key={payment.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyId}>Mã GD: {payment.id}</span>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                      Thanh toán cho: Hóa đơn {payment.invoiceId}
                    </span>
                    <div className={styles.historyMeta}>
                      <span>⏱ {payment.date}</span>
                    </div>
                    {payment.note && (
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        Ghi chú: {payment.note}
                      </span>
                    )}
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.historyAmount}>
                      {payment.amount.toLocaleString("vi-VN")} ₫
                    </span>
                    {getStatusBadge(payment.status)}
                    {payment.proofImage && (
                      <span style={{ fontSize: "12px", color: "var(--primary-blue)", cursor: "pointer", textDecoration: "underline" }}>
                        Xem ảnh biên lai
                      </span>
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
