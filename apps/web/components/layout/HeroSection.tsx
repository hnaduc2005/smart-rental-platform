'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/common';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/rooms?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/rooms');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className={styles.hero}>
      {/* Starfield overlay */}
      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.subtitle}>Nền tảng thuê trọ thông minh #1 Việt Nam</p>
        <h1 className={styles.title}>
          Tìm phòng trọ <span className={styles.highlight}>ưng ý</span>
          <br />chỉ trong vài giây
        </h1>
        <p className={styles.description}>
          Hàng ngàn phòng trọ, căn hộ, ký túc xá được xác minh — tìm ngay nơi ở lý tưởng của bạn
        </p>

        {/* Search Box */}
        <div className={styles.searchBox}>
          <div className={styles.searchInput}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bạn muốn tìm trọ ở đâu? (VD: Quận 1, Bình Thạnh...)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
            />
          </div>
          <Button variant="cta" onClick={handleSearch}>
            🔍 Tìm kiếm ngay
          </Button>
        </div>

        {/* Quick Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>10,000+</span>
            <span className={styles.statLabel}>Phòng trọ</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>63</span>
            <span className={styles.statLabel}>Tỉnh thành</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50,000+</span>
            <span className={styles.statLabel}>Người thuê</span>
          </div>
        </div>
      </div>
    </section>
  );
}
