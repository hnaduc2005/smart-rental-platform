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
  title,
  price,
  area,
  address,
  imageUrl,
  isHot = false,
  onClick,
}: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // In real app: save to API/localStorage
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
