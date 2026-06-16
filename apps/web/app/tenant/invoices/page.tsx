import Link from "next/link";
import { Badge, Button } from "@/components/common";
import { mockInvoicesData } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TenantInvoicesPage() {
  const invoices = mockInvoicesData;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge variant="warning">Chưa thanh toán</Badge>;
      case 'paid':
        return <Badge variant="success">Đã thanh toán</Badge>;
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

      <div className={styles.invoiceList}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className={styles.invoiceCard}>
            {/* Header */}
            <div className={styles.invoiceHeader}>
              <h2 className={styles.invoiceTitle}>
                Hóa đơn {invoice.month}
                <span className={styles.invoiceId}>#{invoice.id}</span>
              </h2>
              <div className={styles.invoiceStatus}>
                <span className={styles.dueDate}>Hạn chót: {invoice.dueDate}</span>
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
                      {invoice.roomRent.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                {/* Tiền điện */}
                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Tiền điện</span>
                    <span className={styles.itemTotal}>
                      {invoice.electricity.total.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className={styles.itemDetails}>
                    <span>Sử dụng: {invoice.electricity.usage} kWh</span>
                    <span>Đơn giá: {invoice.electricity.price.toLocaleString("vi-VN")} ₫/kWh</span>
                  </div>
                  <div className={styles.meterReading}>
                    <img src={invoice.electricity.image} alt="Đồng hồ điện" className={styles.meterImage} />
                    <div className={styles.meterNumbers}>
                      <div className={styles.meterIndex}>
                        <span className={styles.meterLabel}>Chỉ số cũ:</span>
                        <span className={styles.meterValue}>{invoice.electricity.oldIndex}</span>
                      </div>
                      <div className={styles.meterIndex}>
                        <span className={styles.meterLabel}>Chỉ số mới:</span>
                        <span className={styles.meterValue}>{invoice.electricity.newIndex}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiền nước */}
                <div className={styles.breakdownItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>Tiền nước</span>
                    <span className={styles.itemTotal}>
                      {invoice.water.total.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className={styles.itemDetails}>
                    <span>Sử dụng: {invoice.water.usage} khối</span>
                    <span>Đơn giá: {invoice.water.price.toLocaleString("vi-VN")} ₫/khối</span>
                  </div>
                  <div className={styles.meterReading}>
                    <img src={invoice.water.image} alt="Đồng hồ nước" className={styles.meterImage} />
                    <div className={styles.meterNumbers}>
                      <div className={styles.meterIndex}>
                        <span className={styles.meterLabel}>Chỉ số cũ:</span>
                        <span className={styles.meterValue}>{invoice.water.oldIndex}</span>
                      </div>
                      <div className={styles.meterIndex}>
                        <span className={styles.meterLabel}>Chỉ số mới:</span>
                        <span className={styles.meterValue}>{invoice.water.newIndex}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dịch vụ khác */}
                {invoice.services.map((svc, idx) => (
                  <div key={idx} className={styles.breakdownItem} style={{ borderBottom: "none", paddingBottom: 0 }}>
                    <div className={styles.itemHeader} style={{ marginBottom: 0 }}>
                      <span className={styles.itemName} style={{ fontWeight: "normal" }}>{svc.name}</span>
                      <span className={styles.itemTotal} style={{ fontWeight: "normal" }}>
                        {svc.total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className={styles.summarySection}>
                <div>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Tổng thanh toán</span>
                    <span className={styles.totalAmount}>
                      {invoice.totalAmount.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  {invoice.status === 'unpaid' && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                      Vui lòng thanh toán đầy đủ trước ngày {invoice.dueDate} để không bị tính phí phạt.
                    </p>
                  )}
                </div>
                
                {invoice.status === 'unpaid' && (
                  <Link href="/tenant/payments" style={{ width: '100%', textDecoration: 'none' }}>
                    <Button variant="cta" fullWidth>Thanh toán ngay</Button>
                  </Link>
                )}
                {invoice.status === 'paid' && (
                  <div className={styles.actionButton}>
                    <Button variant="secondary" fullWidth disabled>Đã thanh toán</Button>
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
