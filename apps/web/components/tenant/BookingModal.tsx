'use client';

import { useState, useEffect } from 'react';

import { Button, Input } from '@/components/common';
import { apiRequest } from '@/lib/api';
import { getStoredAccessToken, getCurrentUser } from '@/lib/auth';
import styles from './BookingModal.module.css';
import { toast } from "react-hot-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle: string;
  roomPrice: number;
}

function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')} đ/tháng`;
}

export function BookingModal({ isOpen, onClose, roomId, roomTitle, roomPrice }: BookingModalProps) {
  const [requestType, setRequestType] = useState('deposit');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const userPromise = getCurrentUser();
      if (userPromise) {
        userPromise.then(user => {
        if (user?.phone) {
          setPhone(user.phone);
        }
      }).catch(err => console.error("Could not fetch user info for phone number", err));
      }
    } else {
      setPhone('');
      setMessage('');
      setRequestType('deposit');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập để gửi yêu cầu!');
      window.location.href = '/login';
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/rental-requests', {
        method: 'POST',
        token,
        body: {
          roomId,
          message: `[${requestType}] SĐT: ${phone}. Lời nhắn: ${message}`
        }
      });
      toast.success('Gửi yêu cầu thành công!');
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <label className={styles.label}>Số điện thoại của bạn</label>
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập SĐT để chủ trọ liên hệ lại" 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Lời nhắn (Tùy chọn)</label>
            <textarea 
              className={styles.textarea} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="VD: Tôi muốn xem phòng vào sáng Chủ nhật tuần này..."
            ></textarea>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
