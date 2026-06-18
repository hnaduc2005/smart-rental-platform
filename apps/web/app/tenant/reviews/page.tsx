"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [reviewsData, contractsData] = await Promise.all([
        apiRequest<any[]>("/reviews/tenant/my", { token }),
        apiRequest<any[]>("/contracts/tenant/my", { token }),
      ]);
      setReviews(reviewsData);
      setContracts(contractsData);
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return alert("Vui lòng chọn phòng để đánh giá.");
    if (selectedRating === 0) return alert("Vui lòng chọn số sao đánh giá.");

    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      const contract = contracts.find((c) => c.roomId === selectedRoomId);
      await apiRequest("/reviews", {
        method: "POST",
        body: {
          roomId: selectedRoomId,
          contractId: contract?.id,
          rating: selectedRating,
          comment: reviewContent
        },
        token
      });
      alert("Đăng tải đánh giá thành công!");
      setSelectedRoomId("");
      setSelectedRating(0);
      setReviewContent("");
      fetchData(); // Reload reviews
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
            Viết đánh giá mới
          </h2>
          
          <form>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phòng / Hợp đồng cần đánh giá</label>
              <select 
                className={styles.select}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">-- Chọn phòng bạn đã hoặc đang thuê --</option>
                {contracts.map((c) => (
                  <option key={c.roomId} value={c.roomId}>
                    {c.room.name} - {c.room.property.name} ({c.status === "ACTIVE" ? "Đang thuê" : "Đã kết thúc"})
                  </option>
                ))}
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
              <Button variant="primary" fullWidth onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Đăng tải đánh giá"}
              </Button>
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
                      <h2 className={styles.roomName}>{review.room.name} - {review.room.property.name}</h2>
                      <span className={styles.reviewDate}>Đã đánh giá: {new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Body: Nội dung đánh giá */}
                  <div className={styles.cardBody}>
                    <p className={styles.reviewContent}>&quot;{review.comment}&quot;</p>
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
