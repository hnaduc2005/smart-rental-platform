'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/layout';
import { PropertyCard } from '@/components/common';
import { apiRequest } from '@/lib/api';
import styles from '@/app/page.module.css';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [realRooms, setRealRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [roomCategories, setRoomCategories] = useState<any[]>([]);

  React.useEffect(() => {
    apiRequest<any[]>('/rooms')
      .then(data => setRealRooms(data))
      .catch(err => console.error('Failed to load rooms:', err))
      .finally(() => setIsLoading(false));

    apiRequest<any[]>('/room-types')
      .then(data => setRoomCategories(data))
      .catch(err => console.error('Failed to load room types:', err));
  }, []);

  const filteredRooms = activeCategory === 'all'
    ? realRooms
    : realRooms.filter((r) => r.roomType?.id === activeCategory);

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Rooms Section */}
      <section className={styles.section}>
        <div className={styles.container}>

          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Phòng trọ nổi bật</h2>
              <p className={styles.sectionSubtitle}>Danh sách phòng trọ chất lượng được xác minh</p>
            </div>
            <button className={styles.viewAllBtn} onClick={() => router.push('/rooms')}>
              Xem tất cả →
            </button>
          </div>

          {/* Category Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeCategory === 'all' ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Tất cả
            </button>
            {roomCategories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Property Grid */}
          <div className={styles.grid}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>Đang tải danh sách phòng...</div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.slice(0, 10).map((room) => (
                <PropertyCard
                  key={room.id}
                  id={room.id}
                  title={room.name}
                  price={room.price}
                  area={room.area}
                  address={room.address || room.property?.address || room.property?.name || 'Chưa cập nhật'}
                  roomType={room.roomType?.name}
                  maxOccupants={room.maxOccupants}
                  imageUrl={room.images?.[0]?.url || room.images?.[0]}
                  isHot={room.price > 3000000}
                  onClick={() => router.push(`/rooms/${room.id}`)}
                />
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-medium-gray)' }}>
                Hiện chưa có phòng trống nào trong danh mục này.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Feature Banner */}
      <section className={styles.bannerSection}>
        <div className={styles.container}>
          <div className={styles.bannerGrid}>
            <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #0045A8, #00B7FF)' }}>
              <h3 className={styles.bannerTitle}>🏠 Đăng tin cho thuê</h3>
              <p className={styles.bannerDesc}>Tiếp cận hàng ngàn người thuê tiềm năng mỗi ngày</p>
              <span className={styles.bannerBadge}>Dành cho Chủ trọ</span>
            </div>
            <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #00A84A, #00C95C)' }}>
              <h3 className={styles.bannerTitle}>✓ Phòng đã xác minh</h3>
              <p className={styles.bannerDesc}>100% phòng trọ được kiểm duyệt bởi đội ngũ SmartRental</p>
              <span className={styles.bannerBadge}>An toàn & Uy tín</span>
            </div>
            <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #CC4600, #FF5C00)' }}>
              <h3 className={styles.bannerTitle}>⚡ Tìm phòng nhanh</h3>
              <p className={styles.bannerDesc}>Lọc theo giá, diện tích, khu vực chỉ trong vài giây</p>
              <span className={styles.bannerBadge}>Miễn phí 100%</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
