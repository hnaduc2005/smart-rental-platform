'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/common';
import { ReviewModal } from '@/components/tenant';
import styles from './page.module.css';

export default function TenantDashboard() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRoomTitle, setReviewRoomTitle] = useState('');

  // Mock data for requests
  const requests = [
    {
      id: 'req1',
      roomTitle: 'Phòng trọ ban công view đẹp, full nội thất cao cấp',
      date: '10/06/2026',
      status: 'pending',
      type: 'Hẹn xem phòng',
      landlord: 'Nguyễn Văn A - 0901234567'
    },
    {
      id: 'req2',
      roomTitle: 'Ký túc xá sinh viên sạch sẽ gần ĐH Bách Khoa',
      date: '08/06/2026',
      status: 'approved',
      type: 'Đặt cọc',
      landlord: 'Trần Thị B - 0987654321'
    }
  ];

  // Mock data for rented rooms
  const rentedRooms = [
    {
      id: 'rent1',
      roomTitle: 'Studio mini đầy đủ tiện nghi cho người độc thân',
      startDate: '01/01/2026',
      price: '4.500.000 đ',
      nextPayment: '01/07/2026'
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>T</div>
            <h3 className={styles.name}>Người Thuê Test</h3>
            <p className={styles.role}>Tài khoản Người thuê</p>
          </div>
          <nav className={styles.menu}>
            <Link href="/tenant/dashboard" className={`${styles.menuItem} ${styles.active}`}>
              📊 Tổng quan
            </Link>
            <Link href="/tenant/wishlist" className={styles.menuItem}>
              ❤️ Danh sách yêu thích
            </Link>
            <Link href="/tenant/requests" className={styles.menuItem}>
              📝 Lịch sử yêu cầu
            </Link>
            <Link href="/tenant/settings" className={styles.menuItem}>
              ⚙️ Cài đặt tài khoản
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px 0', color: 'var(--text-charcoal)' }}>
            Xin chào, Người Thuê 👋
          </h1>

          {/* Rented Rooms Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏠 Phòng đang thuê</h2>
            {rentedRooms.map(room => (
              <div key={room.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <h4>{room.roomTitle}</h4>
                  <p>Ngày bắt đầu thuê: {room.startDate}</p>
                  <p>Giá thuê: {room.price}/tháng</p>
                  <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>Hạn đóng tiền tiếp theo: {room.nextPayment}</p>
                </div>
                <div className={styles.requestActions}>
                  <Badge variant="success">Đang ở</Badge>
                  <div className={styles.actionBtn}>
                    <Button variant="secondary" onClick={() => {
                      setReviewRoomTitle(room.roomTitle);
                      setIsReviewOpen(true);
                    }}>Viết đánh giá (Review)</Button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Booking Requests Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              📝 Yêu cầu gần đây
              <Link href="/tenant/requests" style={{ fontSize: '13px', color: 'var(--color-deep-blue)', fontWeight: 500, textDecoration: 'none' }}>
                Xem tất cả
              </Link>
            </h2>
            
            {requests.map(req => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <h4>{req.roomTitle}</h4>
                  <p>Loại yêu cầu: <strong>{req.type}</strong></p>
                  <p>Ngày gửi: {req.date}</p>
                  <p>Chủ trọ: {req.landlord}</p>
                </div>
                <div className={styles.requestActions}>
                  {req.status === 'pending' ? (
                    <Badge variant="warning">Chờ xác nhận</Badge>
                  ) : (
                    <Badge variant="success">Đã chấp nhận</Badge>
                  )}
                  <div className={styles.actionBtn}>
                    <Button variant="ghost">Hủy yêu cầu</Button>
                  </div>
                </div>
              </div>
            ))}
          </section>

        </main>
      </div>

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        roomTitle={reviewRoomTitle} 
      />
    </div>
  );
}
