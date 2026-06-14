'use client';

import React from 'react';
import styles from './FilterSidebar.module.css';
import { provinces, districtsByProvince, roomTypes, amenities } from '@/lib/mockData';

export interface FilterState {
  province: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  roomTypes: string[];
  amenities: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MAX_PRICE = 15000000;
const MAX_AREA = 100;

function formatPrice(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  return `${(value / 1000).toFixed(0)}k`;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {

  const update = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const toggleList = (key: 'roomTypes' | 'amenities', id: string) => {
    const current = filters[key];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    update({ [key]: next });
  };

  const reset = () => onChange({
    province: '', district: '',
    minPrice: 0, maxPrice: MAX_PRICE,
    minArea: 0, maxArea: MAX_AREA,
    roomTypes: [], amenities: [],
  });

  const districts = filters.province ? (districtsByProvince[filters.province] ?? []) : [];

  const pricePercent = (filters.maxPrice / MAX_PRICE) * 100;
  const areaPercent = (filters.maxArea / MAX_AREA) * 100;

  return (
    <aside className={styles.sidebar}>
      <p className={styles.sidebarTitle}>
        🔧 Bộ lọc
        <button className={styles.resetBtn} onClick={reset}>Đặt lại</button>
      </p>

      {/* Khu vực */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>📍 Khu vực</p>
        <select
          className={styles.select}
          value={filters.province}
          onChange={(e) => update({ province: e.target.value, district: '' })}
        >
          <option value="">-- Tỉnh / Thành phố --</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <select
          className={styles.select}
          value={filters.district}
          onChange={(e) => update({ district: e.target.value })}
          disabled={!filters.province}
        >
          <option value="">-- Quận / Huyện --</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Khoảng giá */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>💰 Khoảng giá</p>
        <div className={styles.rangeRow}>
          <span className={styles.rangeValue}>Từ {formatPrice(filters.minPrice)}</span>
          <span className={styles.rangeValue}>Đến {formatPrice(filters.maxPrice)}</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={MAX_PRICE}
          step={500000}
          value={filters.minPrice}
          style={{ '--value-percent': `${(filters.minPrice / MAX_PRICE) * 100}%` } as React.CSSProperties}
          onChange={(e) => update({ minPrice: Number(e.target.value) })}
        />
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={MAX_PRICE}
          step={500000}
          value={filters.maxPrice}
          style={{ '--value-percent': `${pricePercent}%` } as React.CSSProperties}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
        />
        <div className={styles.sliderLabels}>
          <span>0đ</span>
          <span>15 triệu/tháng</span>
        </div>
      </div>

      {/* Diện tích */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>📐 Diện tích (m²)</p>
        <div className={styles.rangeRow}>
          <span className={styles.rangeValue}>Từ {filters.minArea} m²</span>
          <span className={styles.rangeValue}>Đến {filters.maxArea} m²</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={MAX_AREA}
          step={5}
          value={filters.minArea}
          style={{ '--value-percent': `${(filters.minArea / MAX_AREA) * 100}%` } as React.CSSProperties}
          onChange={(e) => update({ minArea: Number(e.target.value) })}
        />
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={MAX_AREA}
          step={5}
          value={filters.maxArea}
          style={{ '--value-percent': `${areaPercent}%` } as React.CSSProperties}
          onChange={(e) => update({ maxArea: Number(e.target.value) })}
        />
        <div className={styles.sliderLabels}>
          <span>0 m²</span>
          <span>100 m²</span>
        </div>
      </div>

      {/* Loại phòng */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>🏠 Loại phòng</p>
        <div className={styles.checkList}>
          {roomTypes.map((rt) => {
            const checked = filters.roomTypes.includes(rt.id);
            return (
              <label key={rt.id} className={styles.checkItem} onClick={() => toggleList('roomTypes', rt.id)}>
                <div className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                  {checked && <span className={styles.checkmark}>✓</span>}
                </div>
                {rt.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Tiện ích */}
      <div className={styles.group}>
        <p className={styles.groupLabel}>⚡ Tiện ích</p>
        <div className={styles.checkList}>
          {amenities.map((am) => {
            const checked = filters.amenities.includes(am.id);
            return (
              <label key={am.id} className={styles.checkItem} onClick={() => toggleList('amenities', am.id)}>
                <div className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
                  {checked && <span className={styles.checkmark}>✓</span>}
                </div>
                {am.label}
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
