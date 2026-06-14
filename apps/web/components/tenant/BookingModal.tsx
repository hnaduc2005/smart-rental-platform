'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/common';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  roomPrice: number;
}

function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')} đ/tháng`;
}

export function BookingModal({ isOpen, onClose, roomTitle, roomPrice }: BookingModalProps) {
  const [requestType, setRequestType] = useState('visit');
  
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Gửi yêu cầu đến Chủ trọ</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.roomInfo}>
            <p className={styles.roomTitle}>{roomTitle}</p>
            <p className={styles.roomPrice}>{formatPrice(roomPrice)}</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Loại yêu cầu</label>
            <select 
              className={styles.select}
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              <option value="visit">Hẹn xem phòng</option>
              <option value="deposit">Giữ chỗ / Đặt cọc</option>
              <option value="contact">Nhờ tư vấn thêm</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại của bạn</label>
            <Input placeholder="Nhập SĐT để chủ trọ liên hệ lại" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Lời nhắn (Tùy chọn)</label>
            <textarea 
              className={styles.textarea} 
              placeholder="VD: Tôi muốn xem phòng vào sáng Chủ nhật tuần này..."
            ></textarea>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={() => {
            alert('Gửi yêu cầu thành công!');
            onClose();
          }}>
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </div>
  );
}
