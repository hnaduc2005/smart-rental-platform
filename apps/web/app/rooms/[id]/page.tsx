'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, Badge } from '@/components/common';
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

            {/* Map (Placeholder) */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Vị trí trên bản đồ</h2>
              <div className={styles.mapWrapper}>
                {(() => {
                  const lat = room.latitude || room.property?.latitude;
                  const lng = room.longitude || room.property?.longitude;
                  
                  if (lat && lng) {
                    return (
                      <iframe
                        width="100%"
                        height="400px"
                        style={{ border: 0, borderRadius: '8px' }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.01}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.01}&layer=mapnik&marker=${Number(lat)}%2C${Number(lng)}`}
                      ></iframe>
                    );
                  }
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                      Chủ trọ chưa cập nhật tọa độ bản đồ
                    </div>
                  );
                })()}
              </div>
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
                <div className={styles.avatar}>{room.property?.landlord?.user?.fullName?.charAt(0) || room.landlord?.name?.charAt(0) || 'L'}</div>
                <div>
                  <p className={styles.landlordName}>{room.property?.landlord?.user?.fullName || room.landlord?.name || 'Chủ nhà'}</p>
                  <p className={styles.landlordMeta}>Đang quản lý tài sản này</p>
                </div>
              </div>
              
              <div className={styles.contactActions}>
                <Button variant="cta" style={{ width: '100%' }} onClick={() => setIsBookingOpen(true)}>
                  📞 Đặt hẹn / Gửi yêu cầu thuê
                </Button>
                <Button variant="secondary" style={{ width: '100%' }}>
                  💬 Nhắn tin trực tiếp
                </Button>
                <Button variant="ghost" style={{ width: '100%' }}>
                  🏠 Xem tất cả phòng của chủ này
                </Button>
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
