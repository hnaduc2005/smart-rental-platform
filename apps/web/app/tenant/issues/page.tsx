import { Badge, Button } from "@/components/common";
import { mockIssuesData } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TenantIssuesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Chờ xử lý</Badge>;
      case 'in_progress': return <Badge variant="info">Đang sửa chữa</Badge>;
      case 'resolved': return <Badge variant="success">Đã khắc phục</Badge>;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Báo cáo sự cố</h1>

      <div className={styles.grid}>
        {/* Cột trái: Form tạo báo cáo */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Gửi yêu cầu hỗ trợ mới</h2>

            <form>
              <div className={styles.formGroup}>
                <label className={styles.label}>Loại sự cố</label>
                <select className={styles.select}>
                  <option value="">-- Chọn danh mục --</option>
                  <option value="dien">Sự cố về Điện</option>
                  <option value="nuoc">Sự cố về Nước</option>
                  <option value="internet">Internet / Wifi</option>
                  <option value="vesinh">Vệ sinh chung</option>
                  <option value="anninh">An ninh / Trật tự</option>
                  <option value="thietbi">Thiết bị (Điều hòa, Nóng lạnh...)</option>
                  <option value="khac">Khác</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: Hỏng vòi nước nhà vệ sinh"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả chi tiết</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Mô tả rõ tình trạng để chủ trọ chuẩn bị dụng cụ sửa chữa phù hợp..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Đính kèm hình ảnh (nếu có)</label>
                <label className={styles.uploadBox} htmlFor="issue-image-upload" style={{ cursor: 'pointer' }}>
                  <input
                    id="issue-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: "24px" }}>📸</span>
                  <span style={{ fontSize: "14px", color: "var(--text-dark-gray)" }}>
                    Bấm để chọn ảnh minh họa sự cố
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-dark-gray)" }}>
                    Hỗ trợ JPG, PNG, GIF
                  </span>
                </label>
              </div>

              <div style={{ marginTop: "24px" }}>
                <Button variant="primary" fullWidth>Gửi báo cáo cho Chủ trọ</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Cột phải: Lịch sử báo cáo */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lịch sử yêu cầu</h2>

            <div className={styles.historyList}>
              {mockIssuesData.map((issue) => (
                <div key={issue.id} className={styles.historyItem}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{issue.title}</h3>
                    {getStatusBadge(issue.status)}
                  </div>

                  <div className={styles.itemBody}>
                    <div className={styles.itemMeta}>
                      <span>Mã: {issue.id}</span>
                      <span>•</span>
                      <span>Danh mục: {issue.category}</span>
                      <span>•</span>
                      <span>{issue.date}</span>
                    </div>

                    <p className={styles.itemDesc}>{issue.description}</p>

                    {issue.image && (
                      <img src={issue.image} alt={issue.title} className={styles.itemImage} />
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
