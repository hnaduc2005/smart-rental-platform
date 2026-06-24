'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, PropertyCard } from '@/components/common';
import { FilterSidebar } from '@/components/common/FilterSidebar';
import { FilterState } from '@/components/common/FilterSidebar';
import { apiRequest } from '@/lib/api';
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

  const [rooms, setRooms] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/regions/provinces')
      .then(setProvinces)
      .catch(err => console.error('Failed to load provinces:', err));

    apiRequest<any[]>('/room-types')
      .then(setRoomTypes)
      .catch(err => console.error('Failed to load room types:', err));

    apiRequest<any[]>('/amenities')
      .then(setAmenities)
      .catch(err => console.error('Failed to load amenities:', err));
  }, []);

  useEffect(() => {
    if (filters.province) {
      apiRequest<any[]>(`/regions/provinces/${filters.province}/districts`)
        .then(setDistricts)
        .catch(err => console.error('Failed to load districts:', err));
    } else {
      setDistricts([]);
    }
  }, [filters.province]);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await apiRequest<any[]>('/rooms');
        setRooms(data);
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  // Apply search + filters
  const results = useMemo(() => {
    let list = [...rooms];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q)
      );
    }

    // Province (Region): room's region is a province OR room's region is a district whose parent is the province
    if (filters.province) {
      list = list.filter((r) => {
        if (!r.regionId) return false;
        // Direct match (room region IS the province)
        if (r.regionId === filters.province) return true;
        // Indirect match (room region is a district under the province)
        if (r.region?.parentId === filters.province) return true;
        // Also check property region as fallback
        if (r.property?.regionId === filters.province) return true;
        return false;
      });
    }

    // District
    if (filters.district) list = list.filter((r) => r.regionId === filters.district || r.property?.regionId === filters.district);

    // Price
    list = list.filter((r) => Number(r.price) >= filters.minPrice && Number(r.price) <= filters.maxPrice);

    // Area
    list = list.filter((r) => Number(r.area) >= filters.minArea && Number(r.area) <= filters.maxArea);

    // Room types
    if (filters.roomTypes.length > 0)
      list = list.filter((r) => filters.roomTypes.includes(r.roomTypeId) || filters.roomTypes.includes(r.roomType?.slug));

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'area-asc') list.sort((a, b) => Number(a.area) - Number(b.area));
    if (sort === 'area-desc') list.sort((a, b) => Number(b.area) - Number(a.area));

    return list;
  }, [searchQuery, filters, sort, rooms]);

  // Build active filter tags
  const activeTags: { label: string; onRemove: () => void }[] = [];

  if (filters.province) {
    const prov = provinces.find((p) => p.id === filters.province);
    activeTags.push({ label: prov?.name ?? filters.province, onRemove: () => setFilters((f) => ({ ...f, province: '', district: '' })) });
  }
  if (filters.district) {
    const dist = districts.find((d) => d.id === filters.district);
    activeTags.push({ label: dist?.name ?? filters.district, onRemove: () => setFilters((f) => ({ ...f, district: '' })) });
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
    activeTags.push({ label: rt?.name ?? typeId, onRemove: () => setFilters((f) => ({ ...f, roomTypes: f.roomTypes.filter((x) => x !== typeId) })) });
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
        <FilterSidebar filters={filters} onChange={setFilters} provinces={provinces} districts={districts} roomTypes={roomTypes} amenities={amenities} />

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
          {loading ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Đang tải danh sách phòng...</p>
            </div>
          ) : results.length > 0 ? (
            <div className={styles.grid}>
              {results.map((room) => (
                <PropertyCard
                  key={room.id}
                  id={room.id}
                  title={room.name}
                  price={Number(room.price)}
                  area={Number(room.area)}
                  address={[room.address, room.region?.name].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
                  imageUrl={room.images?.[0]?.url || room.images?.[0] || ''}
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
