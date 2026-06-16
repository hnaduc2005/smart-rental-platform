import { Badge, Button } from "@/components/common";
import { mockMyRoomData } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TenantMyRoomPage() {
  const room = mockMyRoomData;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Phòng của tôi</h1>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.mainContent}>
          {/* Room Summary Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Thông tin phòng</h2>
            <div className={styles.roomInfo}>
              <div className={styles.roomImageWrapper}>
                <img
                  src={room.images[0]}
                  alt={room.title}
                  width={160}
                  height={120}
                  className={styles.roomImage}
                />
              </div>
              <div className={styles.roomDetails}>
                <h3 className={styles.roomName}>{room.title}</h3>
                <p className={styles.roomAddress}>{room.address}</p>
                <p className={styles.roomPrice}>
                  {room.price.toLocaleString("vi-VN")} ₫ / tháng
                </p>
                <div className={styles.actionButtons}>
                  <Button variant="secondary">Xem bài đăng</Button>
                  <Button variant="primary">Liên hệ</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Chi tiết hợp đồng</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Mã hợp đồng</span>
              <span className={styles.infoValue}>{room.contract.contractId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày bắt đầu</span>
              <span className={styles.infoValue}>{room.contract.startDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày kết thúc (Dự kiến)</span>
              <span className={styles.infoValue}>{room.contract.endDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Tiền cọc</span>
              <span className={styles.infoValue}>
                {room.contract.deposit.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Trạng thái</span>
              <Badge variant="success">{room.contract.status}</Badge>
            </div>
          </div>

          {/* Room Rules Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Nội quy phòng trọ</h2>
            <ul className={styles.ruleList}>
              {room.rules.map((rule, index) => (
                <li key={index} className={styles.ruleItem}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.sidebar}>
          {/* Roommates Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Người ở cùng ({room.roommates.length})</h2>
            <div className={styles.roommateList}>
              {room.roommates.map((person) => (
                <div key={person.id} className={styles.roommateItem}>
                  <div className={styles.avatar}>
                    {person.name.charAt(0)}
                  </div>
                  <div className={styles.roommateInfo}>
                    <p className={styles.roommateName}>{person.name}</p>
                    <p className={styles.roommateRole}>{person.role}</p>
                  </div>
                  <div className={styles.roommatePhone}>{person.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Landlord Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Thông tin chủ trọ</h2>
            <div className={styles.roommateItem} style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div className={styles.avatar} style={{ background: "rgba(255, 92, 0, 0.1)", color: "var(--accent-orange)" }}>
                {room.landlord.name.charAt(0)}
              </div>
              <div className={styles.roommateInfo}>
                <p className={styles.roommateName}>{room.landlord.name}</p>
                <p className={styles.roommateRole}>Chủ nhà</p>
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Button variant="primary" style={{ width: "100%", justifyContent: "center" }}>
                Gọi: {room.landlord.phone}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
