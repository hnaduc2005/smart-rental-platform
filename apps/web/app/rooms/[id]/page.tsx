'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, Badge } from '@/components/common';
import { BookingModal } from '@/components/tenant';
import { mockRoomDetails, mockReviews, amenities } from '@/lib/mockData';
import styles from './page.module.css';

interface PageProps {
  params: {
    id: string;
  };
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu/tháng`;
  return `${value.toLocaleString('vi-VN')} đ/tháng`;
}

export default function RoomDetailsPage({ params }: PageProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // In a real app, fetch room by ID. For now, use mock data.
  const room = mockRoomDetails;

  if (!room) {
    notFound();
  }

  const roomAmenities = amenities.filter(a => room.amenities.includes(a.id));

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
              <Badge variant="tag">{room.type}</Badge>
              {room.isHot && <Badge variant="error">HOT</Badge>}
              <Badge variant="success">{room.status}</Badge>
            </div>
            <h1 className={styles.title}>{room.title}</h1>
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
            <img src={room.images[0]} alt="Main" className={styles.mainImage} />
            {room.images[1] && <img src={room.images[1]} alt="Side 1" className={styles.sideImage} />}
            {room.images[2] && <img src={room.images[2]} alt="Side 2" className={styles.sideImage} />}
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
                {roomAmenities.map(amenity => (
                  <div key={amenity.id} className={styles.amenityItem}>
                    <div className={styles.amenityIcon}>✓</div>
                    <span>{amenity.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Map (Placeholder) */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Vị trí trên bản đồ</h2>
              <div className={styles.mapWrapper}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${room.mapCoordinates.lng - 0.01}%2C${room.mapCoordinates.lat - 0.01}%2C${room.mapCoordinates.lng + 0.01}%2C${room.mapCoordinates.lat + 0.01}&layer=mapnik&marker=${room.mapCoordinates.lat}%2C${room.mapCoordinates.lng}`}
                ></iframe>
              </div>
            </section>

            {/* Reviews */}
            <section className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <h2 className={styles.sectionTitle} style={{ border: 'none', margin: 0, padding: 0 }}>Đánh giá từ người thuê</h2>
                <Badge variant="info">⭐ {mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length} / 5</Badge>
              </div>
              
              <div>
                {mockReviews.map(review => (
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
                <div className={styles.avatar}>{room.landlord.name.charAt(0)}</div>
                <div>
                  <p className={styles.landlordName}>{room.landlord.name}</p>
                  <p className={styles.landlordMeta}>Đã tham gia: {room.landlord.joinedDate}</p>
                  <p className={styles.landlordMeta}>Đang có {room.landlord.totalRooms} phòng</p>
                </div>
              </div>
              
              <div className={styles.contactActions}>
                <Button variant="cta" style={{ width: '100%' }} onClick={() => setIsBookingOpen(true)}>
                  📞 Liên hệ: {room.landlord.phone}
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
        roomTitle={room.title} 
        roomPrice={room.price} 
      />
    </div>
  );
}
