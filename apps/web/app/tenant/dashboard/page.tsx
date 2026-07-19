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
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [contractsData, reqData, invoicesData] = await Promise.all([
        apiRequest<any[]>("/contracts/tenant/my", { token }),
        apiRequest<any[]>("/rental-requests/seeker/my", { token }),
        apiRequest<any[]>("/invoices/tenant/my", { token }).catch(() => []), // fallback if error
      ]);
      setContracts(contractsData);
      setRequests(reqData);
      setInvoices(invoicesData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

  // Compute stats
  const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  const totalUnpaid = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const pendingRequestsCount = requests.filter(req => req.status === 'PENDING').length;

  const parseMessage = (msg: string) => {
    if (!msg) return { type: 'Khác', text: '' };
    if (msg.startsWith('[deposit]')) {
      const parts = msg.replace('[deposit]', '').split('. Lời nhắn:');
      return { 
        type: '💰 Đặt cọc', 
        text: parts.length > 1 ? parts[1].trim() : parts[0].trim() 
      };
    }
    return { type: 'Khác', text: msg };
  };

  return (
    <div className={styles.content}>

      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px 0', color: 'var(--text-charcoal)' }}>
        Xin chào, Người Thuê 👋
      </h1>

      {/* Quick Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-medium-gray)', fontWeight: 500 }}>Tiền cần thanh toán</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: totalUnpaid > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {totalUnpaid.toLocaleString('vi-VN')} ₫
          </h3>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-medium-gray)', fontWeight: 500 }}>Hóa đơn chưa thanh toán</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: 'var(--text-charcoal)' }}>
            {pendingInvoices.length} <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-medium-gray)' }}>hóa đơn</span>
          </h3>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-medium-gray)', fontWeight: 500 }}>Yêu cầu đang xử lý</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', color: 'var(--text-charcoal)' }}>
            {pendingRequestsCount} <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-medium-gray)' }}>yêu cầu</span>
          </h3>
        </div>
      </div>

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
              <p style={{ color: 'var(--text-charcoal)', fontWeight: 600 }}>Ngày đóng tiền: Mùng {contract.paymentDueDay} hàng tháng</p>
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

      {/* Unpaid Invoices Section */}
      {pendingInvoices.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            🧾 Hóa đơn cần thanh toán
            <Link href="/tenant/invoices" style={{ fontSize: '13px', color: 'var(--color-deep-blue)', fontWeight: 500, textDecoration: 'none' }}>
              Xem tất cả →
            </Link>
          </h2>
          {pendingInvoices.slice(0, 3).map(inv => (
            <div key={inv.id} className={styles.requestCard}>
              <div className={styles.requestInfo}>
                <h4 style={{ color: 'var(--color-error)' }}>Hóa đơn tháng {inv.month}/{inv.year}</h4>
                <p>Phòng: {inv.contract?.room?.name || 'Đang cập nhật'}</p>
                <p>Tổng tiền: <span style={{ fontWeight: 'bold' }}>{Number(inv.totalAmount).toLocaleString('vi-VN')} ₫</span></p>
                <p>Hạn chót: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className={styles.requestActions}>
                <Badge variant="error">Chưa thanh toán</Badge>
                <div className={styles.actionBtn} style={{ marginTop: '12px' }}>
                  <Link href={`/tenant/invoices/${inv.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary">Thanh toán</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

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
              <p><span style={{ fontWeight: 600 }}>{parseMessage(req.message).type}</span></p>
              <p>Lời nhắn: {parseMessage(req.message).text || <span style={{ fontStyle: 'italic', color: '#999' }}>(Không có nội dung)</span>}</p>
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
