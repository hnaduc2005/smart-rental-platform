'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common';
import modalStyles from './BookingModal.module.css';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
}

export function ReviewModal({ isOpen, onClose, roomTitle }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen) return null;

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h3 className={modalStyles.title}>Đánh giá phòng trọ</h3>
          <button className={modalStyles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={modalStyles.body}>
          <div className={modalStyles.roomInfo}>
            <p className={modalStyles.roomTitle}>{roomTitle}</p>
          </div>

          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Chất lượng phòng (1-5 sao)</label>
            <div className={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${styles.star} ${(hoverRating || rating) >= star ? styles.active : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Chia sẻ trải nghiệm của bạn</label>
            <textarea 
              className={modalStyles.textarea} 
              placeholder="Phòng có giống hình không? Chủ nhà thế nào? Tiện ích xung quanh ra sao?..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className={modalStyles.footer}>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={() => {
            if (rating === 0) {
              alert('Vui lòng chọn số sao đánh giá!');
              return;
            }
            alert('Đã gửi đánh giá thành công! Cảm ơn bạn.');
            onClose();
          }}>
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
}
