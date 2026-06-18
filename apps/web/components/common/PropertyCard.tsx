import React from 'react';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  id: number | string;
  title: string;
  price: number;
  area: number;
  address: string;
  imageUrl?: string;
  isHot?: boolean;
  onClick?: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)} triệu/tháng`;
  }
  return `${price.toLocaleString('vi-VN')}đ/tháng`;
}

export function PropertyCard({
  id,
  title,
  price,
  area,
  address,
  imageUrl,
  isHot = false,
  onClick,
}: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('smart-rental.wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        if (list.some((item: any) => item.id === id)) {
          setIsWishlisted(true);
        }
      }
    } catch (e) {}
  }, [id]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newStatus = !isWishlisted;
    setIsWishlisted(newStatus);
    
    try {
      const stored = localStorage.getItem('smart-rental.wishlist');
      let list = stored ? JSON.parse(stored) : [];
      
      if (newStatus) {
        // Add to wishlist
        if (!list.some((item: any) => item.id === id)) {
          list.push({ id, title, price, area, address, imageUrl, isHot });
        }
      } else {
        // Remove from wishlist
        list = list.filter((item: any) => item.id !== id);
      }
      
      localStorage.setItem('smart-rental.wishlist', JSON.stringify(list));
      
      // Dispatch an event so other components (like Wishlist page) can update
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (e) {
      console.error("Lỗi khi lưu yêu thích", e);
    }
  };

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={styles.image}
          />
        ) : (
          <div
            className={styles.image}
            style={{ background: 'linear-gradient(135deg, #E6ECF6 0%, #C5D5F0 100%)' }}
          />
        )}
        {isHot && <span className={styles.hotBadge}>HOT</span>}
        <button 
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
          onClick={handleWishlist}
          title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.price}>{formatPrice(price)}</p>
        <p className={styles.meta}>
          <span>📐 {area} m²</span>
        </p>
        <p className={styles.address}>📍 {address}</p>
      </div>
    </div>
  );
}
