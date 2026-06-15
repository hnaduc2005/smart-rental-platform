'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard, Button } from '@/components/common';
import { mockRooms } from '@/lib/mockData';
import styles from './page.module.css';

export default function WishlistPage() {
  const router = useRouter();
  
  // Mock wishlist state. In real app, fetch from API.
  // We'll just randomly select 3 rooms for the mock
  const [wishlist, setWishlist] = useState(() => mockRooms.slice(2, 5));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Danh sách Yêu thích</h1>
          <p className={styles.subtitle}>
            Bạn đã lưu {wishlist.length} phòng trọ. Theo dõi và liên hệ chủ trọ khi sẵn sàng.
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className={styles.grid}>
            {wishlist.map((room) => (
              <PropertyCard
                key={room.id}
                {...room}
                onClick={() => router.push(`/rooms/${room.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🤍</span>
            <h2 className={styles.emptyTitle}>Chưa có phòng nào trong danh sách</h2>
            <p className={styles.emptyText}>
              Hãy tìm kiếm và thả tim những phòng trọ bạn ưng ý nhé!
            </p>
            <Button variant="cta" onClick={() => router.push('/rooms')}>
              🔍 Tìm phòng ngay
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
