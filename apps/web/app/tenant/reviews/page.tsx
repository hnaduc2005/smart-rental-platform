"use client";

import { useState } from "react";
import { Button } from "@/components/common";
import { mockReviewsData } from "@/lib/mockData";
import styles from "./page.module.css";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#FFB800' : '#D1D5DB' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function TenantReviewsPage() {
  const reviews = mockReviewsData;
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (review: any) => {
    setEditingId(review.id);
    // Tạm gán mock giá trị phòng dựa theo review
    setSelectedRoom(review.id === "REV-2026-001" ? "room1" : "room2");
    setSelectedRating(review.rating);
    setReviewContent(review.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedRoom("");
    setSelectedRating(0);
    setReviewContent("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý Đánh giá</h1>
      </div>

      <div className={styles.grid}>
        {/* Cột trái: Form Viết Đánh giá mới */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editingId ? "Cập nhật đánh giá" : "Viết đánh giá mới"}
          </h2>
          
          <form>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phòng / Hợp đồng cần đánh giá</label>
              <select 
                className={styles.select}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">-- Chọn phòng bạn đã hoặc đang thuê --</option>
                <option value="room1">Phòng 101 - Số 12 Nguyễn Văn Cừ (Đang thuê)</option>
                <option value="room2">Phòng 205 - Số 88 Lê Văn Sỹ (Đã kết thúc)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Chất lượng phòng & Chủ trọ</label>
              <div className={styles.ratingInput} onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`${styles.ratingStar} ${(hoverRating || selectedRating) >= star ? styles.ratingActive : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setSelectedRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nhận xét chi tiết</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Chia sẻ trải nghiệm của bạn về sự sạch sẽ, an ninh, thái độ của chủ trọ..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <Button variant="primary" fullWidth>
                {editingId ? "Lưu thay đổi" : "Đăng tải đánh giá"}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Hủy
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Cột phải: Lịch sử Đánh giá */}
        <div>
          <h2 className={styles.formTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>
            Đánh giá của tôi ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⭐</div>
              <h2 className={styles.emptyTitle}>Chưa có đánh giá nào</h2>
              <p className={styles.emptyDesc}>
                Sau khi kết thúc hợp đồng thuê, bạn có thể viết đánh giá<br />
                về phòng trọ để giúp các bạn thuê sau tham khảo.
              </p>
            </div>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  {/* Header: Tên phòng + Sao */}
                  <div className={styles.cardHeader}>
                    <div className={styles.roomInfo}>
                      <h2 className={styles.roomName}>{review.roomName}</h2>
                      <span className={styles.reviewDate}>Đã đánh giá: {review.createdAt}</span>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Body: Nội dung đánh giá */}
                  <div className={styles.cardBody}>
                    <p className={styles.reviewContent}>&quot;{review.content}&quot;</p>

                    <div className={styles.cardActions}>
                      {review.canEdit ? (
                        <>
                          <Button variant="secondary" onClick={() => handleEdit(review)}>Chỉnh sửa</Button>
                          <Button variant="ghost">Xóa</Button>
                        </>
                      ) : (
                        <span style={{ fontSize: "13px", color: "var(--text-dark-gray)", fontStyle: "italic" }}>
                          ⚠ Đã quá 30 ngày, không thể chỉnh sửa đánh giá này.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
