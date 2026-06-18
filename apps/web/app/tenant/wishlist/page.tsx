'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard, Button } from '@/components/common';
import styles from './page.module.css';

export default function WishlistPage() {
  const router = useRouter();
  
  const [wishlist, setWishlist] = useState<any[]>([]);

  React.useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem('smart-rental.wishlist');
        if (stored) {
          setWishlist(JSON.parse(stored));
        } else {
          setWishlist([]);
        }
      } catch (e) {
        console.error("Lỗi tải yêu thích", e);
      }
    };

    loadWishlist();

    window.addEventListener('wishlistUpdated', loadWishlist);
    return () => window.removeEventListener('wishlistUpdated', loadWishlist);
  }, []);

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
