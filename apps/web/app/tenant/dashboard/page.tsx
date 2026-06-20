'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/common';
import { ReviewModal } from '@/components/tenant';
import { apiRequest, getStoredAccessToken } from '@/lib';
import { CONTRACT_STATUS_MAP, RENTAL_REQUEST_STATUS_MAP, translateStatus } from '@/lib/status-translators';
import styles from './page.module.css';

export default function TenantDashboard() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRoomTitle, setReviewRoomTitle] = useState('');
  const [reviewRoomId, setReviewRoomId] = useState('');
  const [reviewContractId, setReviewContractId] = useState('');

  const [contracts, setContracts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [contractsData, reqData] = await Promise.all([
        apiRequest<any[]>("/contracts/tenant/my", { token }),
        apiRequest<any[]>("/rental-requests/seeker/my", { token }),
      ]);
      setContracts(contractsData);
      setRequests(reqData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.content}>

      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px 0', color: 'var(--text-charcoal)' }}>
        Xin chào, Người Thuê 👋
      </h1>

      {/* Rented Rooms Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🏠 Phòng đang thuê</h2>
        {contracts.length === 0 ? (
          <p style={{ color: 'var(--text-medium-gray)' }}>Bạn chưa thuê phòng nào.</p>
        ) : contracts.map(contract => (
          <div key={contract.id} className={styles.requestCard}>
            <div className={styles.requestInfo}>
              <h4>{contract.room?.name} - {contract.room?.property?.name}</h4>
              <p>Ngày bắt đầu thuê: {new Date(contract.startDate).toLocaleDateString('vi-VN')}</p>
              <p>Giá thuê: {Number(contract.rentAmount).toLocaleString('vi-VN')} ₫/tháng</p>
              <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>Ngày đóng tiền: Mùng {contract.paymentDueDay} hàng tháng</p>
            </div>
            <div className={styles.requestActions}>
              <Badge variant="success">{translateStatus(contract.status, CONTRACT_STATUS_MAP)}</Badge>
              <div className={styles.actionBtn}>
                <Link href={`/tenant/reviews`} style={{ textDecoration: 'none' }}>
                  <Button variant="secondary">Đánh giá phòng</Button>
                </Link>
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
            Xem tất cả →
          </Link>
        </h2>

        {requests.length === 0 ? (
          <p style={{ color: 'var(--text-medium-gray)' }}>Không có yêu cầu nào gần đây.</p>
        ) : requests.map(req => (
          <div key={req.id} className={styles.requestCard}>
            <div className={styles.requestInfo}>
              <h4>{req.room?.name} - {req.room?.property?.name}</h4>
              <p>Lời nhắn: {req.message}</p>
              <p>Ngày gửi: {new Date(req.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>Chủ trọ: {req.room?.property?.landlord?.publicDisplayName} ({req.room?.property?.landlord?.publicPhone})</p>
            </div>
            <div className={styles.requestActions}>
              <Badge variant={req.status === 'APPROVED' ? 'success' : (req.status === 'REJECTED' || req.status === 'CANCELLED') ? 'error' : 'warning'}>
                {translateStatus(req.status, RENTAL_REQUEST_STATUS_MAP)}
              </Badge>
            </div>
          </div>
        ))}
      </section>


    </div>
  );
}
