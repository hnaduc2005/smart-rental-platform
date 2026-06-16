import { Badge, Button } from "@/components/common";
import styles from "./page.module.css";

const mockRequests = [
  {
    id: "REQ-2026-004",
    type: "Hẹn xem phòng",
    roomTitle: "Phòng trọ ban công view đẹp, full nội thất cao cấp",
    roomAddress: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    landlord: "Nguyễn Văn A",
    phone: "0901234567",
    date: "10/06/2026",
    scheduledTime: "14:00 - 15/06/2026",
    status: "pending",
    note: "Muốn xem phòng vào buổi chiều trong tuần.",
  },
  {
    id: "REQ-2026-003",
    type: "Đặt cọc",
    roomTitle: "Ký túc xá sinh viên sạch sẽ gần ĐH Bách Khoa",
    roomAddress: "Lý Thường Kiệt, Quận 10, TP.HCM",
    landlord: "Trần Thị B",
    phone: "0987654321",
    date: "08/06/2026",
    scheduledTime: "",
    status: "approved",
    note: "Đã đặt cọc 1 tháng.",
  },
  {
    id: "REQ-2026-002",
    type: "Hẹn xem phòng",
    roomTitle: "Chung cư mini cao cấp có thang máy, bảo vệ 24/7",
    roomAddress: "Nguyễn Lương Bằng, Quận 7, TP.HCM",
    landlord: "Lê Văn C",
    phone: "0912345678",
    date: "01/06/2026",
    scheduledTime: "09:00 - 03/06/2026",
    status: "rejected",
    note: "Chủ trọ báo phòng đã có người thuê rồi.",
  },
  {
    id: "REQ-2026-001",
    type: "Hẹn xem phòng",
    roomTitle: "Studio mini đầy đủ tiện nghi cho người độc thân",
    roomAddress: "Võ Văn Tần, Quận 3, TP.HCM",
    landlord: "Phạm Thị D",
    phone: "0934567890",
    date: "20/05/2026",
    scheduledTime: "10:00 - 22/05/2026",
    status: "approved",
    note: "",
  },
];

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "error" | "info" }> = {
  pending: { label: "Chờ xác nhận", variant: "warning" },
  approved: { label: "Đã chấp nhận", variant: "success" },
  rejected: { label: "Bị từ chối", variant: "error" },
};

const typeIcon: Record<string, string> = {
  "Hẹn xem phòng": "📅",
  "Đặt cọc": "💰",
};

export default function TenantRequestsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Lịch sử yêu cầu</h1>

      <div className={styles.requestList}>
        {mockRequests.map((req) => (
          <div key={req.id} className={styles.requestCard}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <span className={styles.typeTag}>
                  {typeIcon[req.type]} {req.type}
                </span>
                <span className={styles.reqId}>#{req.id}</span>
                <span className={styles.reqDate}>📅 {req.date}</span>
              </div>
              <Badge variant={statusConfig[req.status].variant}>
                {statusConfig[req.status].label}
              </Badge>
            </div>

            {/* Body */}
            <div className={styles.cardBody}>
              <div className={styles.roomInfo}>
                <h3 className={styles.roomTitle}>{req.roomTitle}</h3>
                <p className={styles.roomAddress}>📍 {req.roomAddress}</p>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Chủ trọ</span>
                  <span className={styles.detailValue}>{req.landlord}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Số điện thoại</span>
                  <span className={styles.detailValue}>{req.phone}</span>
                </div>
                {req.scheduledTime && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Lịch hẹn</span>
                    <span className={styles.detailValue}>{req.scheduledTime}</span>
                  </div>
                )}
                {req.note && (
                  <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                    <span className={styles.detailLabel}>Ghi chú</span>
                    <span className={styles.detailValue} style={{ fontStyle: "italic" }}>{req.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {req.status === "pending" && (
              <div className={styles.cardFooter}>
                <Button variant="ghost">Hủy yêu cầu</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
