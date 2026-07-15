'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@/components/common';
import MapDisplay from '@/components/common/Map/MapDisplay';
import { BookingModal } from '@/components/tenant';

import { apiRequest } from '@/lib/api';
import { ROOM_STATUS_MAP, translateStatus } from '@/lib/status-translators';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu/tháng`;
  return `${value.toLocaleString('vi-VN')} đ/tháng`;
}

export default function RoomDetailsPage({ params }: PageProps) {
  const unwrappedParams = React.use(params);
  const roomId = unwrappedParams.id;
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchRoom() {
      try {
        const data = await apiRequest(`/rooms/${roomId}`);
        setRoom(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải thông tin phòng...</div>;
  }

  if (!room) {
    notFound();
  }

  const handleCopyPhone = (phone: string) => {
    if (!phone || phone === 'Chưa cập nhật') return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roomAmenities = room.amenities?.map((ra: any) => ra.amenity) || [];
  const reviews = room.reviews || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link> / <Link href="/rooms">Tìm phòng</Link> / {room.title}
        </div>

        {/* Header Section */}
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="tag">{room.roomType?.name || room.type || 'Phòng trọ'}</Badge>
              {room.isHot && <Badge variant="error">HOT</Badge>}
              <Badge variant="success">{translateStatus(room.status, ROOM_STATUS_MAP)}</Badge>
            </div>
            <h1 className={styles.title}>{room.name || room.title}</h1>
            <p className={styles.address}>📍 {room.address}</p>
          </div>
          <div className={styles.priceArea}>
            <p className={styles.price}>{formatPrice(room.price)}</p>
            <p className={styles.area}>📐 Diện tích: {room.area} m²</p>
          </div>
        </div>

        {/* Image Gallery */}
        {room.images && room.images.length > 0 && (
          <div className={styles.gallery}>
            <img src={room.images[0]?.url || room.images[0]} alt="Main" className={styles.mainImage} />
            {room.images[1] && <img src={room.images[1]?.url || room.images[1]} alt="Side 1" className={styles.sideImage} />}
            {room.images[2] && <img src={room.images[2]?.url || room.images[2]} alt="Side 2" className={styles.sideImage} />}
          </div>
        )}

        <div className={styles.contentLayout}>
          
          {/* Main Column */}
          <div className={styles.mainColumn}>
            
            {/* Description */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Thông tin mô tả</h2>
              <p className={styles.description}>{room.description}</p>
            </section>

            {/* Amenities */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tiện ích nổi bật</h2>
              <div className={styles.amenitiesGrid}>
                {roomAmenities.map((amenity: any) => (
                  <div key={amenity.id} className={styles.amenityItem}>
                    <div className={styles.amenityIcon}>✓</div>
                    <span>{amenity.name || amenity.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Vị trí trên bản đồ</h2>
                {(room.address || room.property?.address || room.latitude || room.property?.latitude) && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      (room.latitude || room.property?.latitude) && (room.longitude || room.property?.longitude)
                        ? `${room.latitude || room.property?.latitude},${room.longitude || room.property?.longitude}`
                        : encodeURIComponent(room.address || room.property?.address || '')
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: 'var(--color-deep-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '100px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                  >
                    🗺️ Xem trên Google Maps
                  </a>
                )}
              </div>
              <MapDisplay 
                latitude={room.latitude || room.property?.latitude} 
                longitude={room.longitude || room.property?.longitude} 
                address={room.address || room.property?.address} 
                height="450px" 
              />
            </section>

            {/* Reviews */}
            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <h2 className={styles.sectionTitle} style={{ border: 'none', margin: 0, padding: 0 }}>Đánh giá từ người thuê</h2>
                <Badge variant="info">⭐ {reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0} / 5</Badge>
              </div>
              
              <div>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-medium-gray)' }}>Chưa có đánh giá nào cho phòng này.</p>
                ) : reviews.map((review: any) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewer}>
                        <div className={styles.reviewerAvatar}>{review.author.charAt(0)}</div>
                        <div>
                          <p className={styles.reviewerName}>{review.author}</p>
                          <p className={styles.reviewDate}>{review.date}</p>
                        </div>
                      </div>
                      <div className={styles.reviewRating}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className={styles.reviewContent}>{review.content}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebarColumn}>
            <section className={styles.section}>
              <div className={styles.landlordProfile}>
                <div className={styles.avatar}>{room.property?.landlord?.publicDisplayName?.charAt(0) || room.property?.landlord?.user?.fullName?.charAt(0) || room.landlord?.name?.charAt(0) || 'L'}</div>
                <div>
                  <p className={styles.landlordName}>{room.property?.landlord?.publicDisplayName || room.property?.landlord?.businessName || room.property?.landlord?.user?.fullName || room.landlord?.name || 'Chủ nhà'}</p>
                  <p className={styles.landlordMeta}>Đang quản lý tài sản này</p>
                </div>
              </div>
              
              <div className={styles.contactActions}>
                <Button variant="cta" style={{ width: '100%' }} onClick={() => setIsBookingOpen(true)}>
                  Gửi yêu cầu thuê
                </Button>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '4px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-medium-gray)', fontWeight: 600 }}>SĐT / Zalo liên hệ:</p>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      backgroundColor: 'white',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onClick={() => handleCopyPhone(room.publicContactPhone || room.property?.landlord?.publicPhone || room.landlord?.phone || 'Chưa cập nhật')}
                    title="Nhấn để sao chép"
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-deep-blue)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-deep-blue)', letterSpacing: '0.5px' }}>
                      {room.publicContactPhone || room.property?.landlord?.publicPhone || room.landlord?.phone || 'Chưa cập nhật'}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: 600,
                      color: copied ? '#059669' : 'var(--text-medium-gray)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: copied ? '#D1FAE5' : '#F1F5F9',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {copied ? '✓ Đã chép' : '📋 Sao chép'}
                    </span>
                  </div>
                </div>
                {(() => {
                  const landlordId = room.property?.landlordId || room.property?.landlord?.id || room.landlord?.id || room.landlordId;
                  return landlordId ? (
                    <Link href={`/rooms?landlordId=${landlordId}`} style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                      <Button variant="ghost" style={{ width: '100%' }}>
                        🏠 Xem tất cả phòng của chủ này
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" style={{ width: '100%' }}>
                      🏠 Xem tất cả phòng của chủ này
                    </Button>
                  );
                })()}
              </div>
            </section>
          </div>

        </div>
      </div>
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        roomId={roomId}
        roomTitle={room.name || room.title} 
        roomPrice={room.price} 
      />
    </div>
  );
}
