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

        {/* Platform Commitments */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon} style={{ color: '#4ade80', background: 'rgba(74,222,128,0.15)', borderColor: 'rgba(74,222,128,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </span>
            <span className={styles.statNumber}>Đã xác minh</span>
            <span className={styles.statLabel}>Chủ trọ được kiểm duyệt</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statIcon} style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <span className={styles.statNumber}>Miễn phí</span>
            <span className={styles.statLabel}>Không phí môi giới</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statIcon} style={{ color: '#c084fc', background: 'rgba(192,132,252,0.15)', borderColor: 'rgba(192,132,252,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </span>
            <span className={styles.statNumber}>Hình thực tế</span>
            <span className={styles.statLabel}>Ảnh chụp thực từ phòng</span>
          </div>
        </div>
      </div>
    </section>
  );
}
