'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, PropertyCard } from '@/components/common';
import { FilterSidebar } from '@/components/common/FilterSidebar';
import { FilterState } from '@/components/common/FilterSidebar';
import { mockRooms, provinces, districtsByProvince, roomTypes } from '@/lib/mockData';
import styles from '@/app/rooms/page.module.css';

const DEFAULT_FILTERS: FilterState = {
  province: '',
  district: '',
  minPrice: 0,
  maxPrice: 15000000,
  minArea: 0,
  maxArea: 100,
  roomTypes: [],
  amenities: [],
};

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState('default');

  // Apply search + filters
  const results = useMemo(() => {
    let list = [...mockRooms];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
      );
    }

    // Province
    if (filters.province) list = list.filter((r) => r.province === filters.province);

    // District
    if (filters.district) list = list.filter((r) => r.district === filters.district);

    // Price
    list = list.filter((r) => r.price >= filters.minPrice && r.price <= filters.maxPrice);

    // Area
    list = list.filter((r) => r.area >= filters.minArea && r.area <= filters.maxArea);

    // Room types
    if (filters.roomTypes.length > 0)
      list = list.filter((r) => filters.roomTypes.includes(r.type));

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'area-asc') list.sort((a, b) => a.area - b.area);
    if (sort === 'area-desc') list.sort((a, b) => b.area - a.area);

    return list;
  }, [searchQuery, filters, sort]);

  // Build active filter tags
  const activeTags: { label: string; onRemove: () => void }[] = [];

  if (filters.province) {
    const prov = provinces.find((p) => p.id === filters.province);
    activeTags.push({ label: prov?.label ?? filters.province, onRemove: () => setFilters((f) => ({ ...f, province: '', district: '' })) });
  }
  if (filters.district) {
    const districts = districtsByProvince[filters.province] ?? [];
    const dist = districts.find((d) => d.id === filters.district);
    activeTags.push({ label: dist?.label ?? filters.district, onRemove: () => setFilters((f) => ({ ...f, district: '' })) });
  }
  if (filters.maxPrice < 15000000) {
    activeTags.push({ label: `Đến ${(filters.maxPrice / 1000000).toFixed(0)} triệu`, onRemove: () => setFilters((f) => ({ ...f, maxPrice: 15000000 })) });
  }
  if (filters.minPrice > 0) {
    activeTags.push({ label: `Từ ${(filters.minPrice / 1000000).toFixed(1)} triệu`, onRemove: () => setFilters((f) => ({ ...f, minPrice: 0 })) });
  }
  if (filters.maxArea < 100) {
    activeTags.push({ label: `Đến ${filters.maxArea} m²`, onRemove: () => setFilters((f) => ({ ...f, maxArea: 100 })) });
  }
  filters.roomTypes.forEach((typeId) => {
    const rt = roomTypes.find((r) => r.id === typeId);
    activeTags.push({ label: rt?.label ?? typeId, onRemove: () => setFilters((f) => ({ ...f, roomTypes: f.roomTypes.filter((x) => x !== typeId) })) });
  });

  return (
    <div className={styles.page}>
      {/* Search Bar at top */}
      <div className={styles.searchBar}>
        <div className={styles.searchBarInner}>
          <div className={styles.searchInputWrapper}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchQuery)}
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
          <Button variant="cta" onClick={() => {}}>🔍 Tìm kiếm</Button>
        </div>
      </div>

      {/* Body: Sidebar + Results */}
      <div className={styles.body}>

        {/* Filter Sidebar */}
        <FilterSidebar filters={filters} onChange={setFilters} />

        {/* Results */}
        <div className={styles.results}>

          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              Tìm thấy <strong>{results.length}</strong> phòng trọ
            </p>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="area-asc">Diện tích: Nhỏ → Lớn</option>
              <option value="area-desc">Diện tích: Lớn → Nhỏ</option>
            </select>
          </div>

          {/* Active Filter Tags */}
          {activeTags.length > 0 && (
            <div className={styles.activeFilters}>
              {activeTags.map((tag, i) => (
                <span key={i} className={styles.filterTag}>
                  {tag.label}
                  <span className={styles.filterTagRemove} onClick={tag.onRemove}>×</span>
                </span>
              ))}
            </div>
          )}

          {/* Property Grid */}
          {results.length > 0 ? (
            <div className={styles.grid}>
              {results.map((room) => (
                <PropertyCard
                  key={room.id}
                  {...room}
                  onClick={() => router.push(`/rooms/${room.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyText}>Không tìm thấy phòng nào phù hợp</p>
              <p className={styles.emptySubtext}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>}>
      <RoomsContent />
    </Suspense>
  );
}
