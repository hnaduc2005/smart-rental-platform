'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/layout';
import { PropertyCard, Badge } from '@/components/common';
import { mockRooms, roomCategories } from '@/lib/mockData';
import styles from '@/app/page.module.css';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  const filteredRooms = activeCategory === 'all'
    ? mockRooms
    : mockRooms.filter((_, i) => i % roomCategories.findIndex(c => c.id === activeCategory) === 0);

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
            {roomCategories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Property Grid */}
          <div className={styles.grid}>
            {mockRooms.slice(0, 10).map((room) => (
              <PropertyCard
                key={room.id}
                {...room}
                onClick={() => router.push(`/rooms/${room.id}`)}
              />
            ))}
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
              <Badge variant="info">Dành cho Chủ trọ</Badge>
            </div>
            <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #00A84A, #00C95C)' }}>
              <h3 className={styles.bannerTitle}>✓ Phòng đã xác minh</h3>
              <p className={styles.bannerDesc}>100% phòng trọ được kiểm duyệt bởi đội ngũ SmartRental</p>
              <Badge variant="success">An toàn & Uy tín</Badge>
            </div>
            <div className={styles.banner} style={{ background: 'linear-gradient(135deg, #CC4600, #FF5C00)' }}>
              <h3 className={styles.bannerTitle}>⚡ Tìm phòng nhanh</h3>
              <p className={styles.bannerDesc}>Lọc theo giá, diện tích, khu vực chỉ trong vài giây</p>
              <Badge variant="warning">Miễn phí 100%</Badge>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
