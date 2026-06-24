"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button, Input } from "@/components/common";

const MapWithPin = dynamic(() => import("./MapWithPin"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", borderRadius: "8px" }}>Đang tải bản đồ...</div>
});

interface LocationPickerProps {
  latitude: number | string;
  longitude: number | string;
  onLatitudeChange: (val: string) => void;
  onLongitudeChange: (val: string) => void;
}

export default function LocationPicker({ latitude, longitude, onLatitudeChange, onLongitudeChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Default to Hanoi if no coordinates provided
  const lat = latitude ? Number(latitude) : 21.028511;
  const lng = longitude ? Number(longitude) : 105.804817;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      // Dọn dẹp query để giúp Nominatim dễ tìm hơn (xóa mã bưu điện, chữ vietnam dư thừa)
      let cleanQuery = searchQuery
        .replace(/\b\d{5,6}\b/g, '') // Xóa mã bưu điện 5-6 số (vd: 700000)
        .replace(/,\s*(vietnam|việt nam)$/i, '') // Xóa đuôi vietnam nếu có
        .trim();
        
      const query = cleanQuery.toLowerCase().includes('việt nam') || cleanQuery.toLowerCase().includes('vietnam') 
        ? cleanQuery 
        : `${cleanQuery}, Việt Nam`;
        
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn`,
        {
          headers: {
            "Accept-Language": "vi-VN,vi;q=0.9",
            "User-Agent": "SmartRentalPlatform/1.0"
          }
        }
      );
      
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(data);
        if (data.length === 1) {
          handleSelectResult(data[0]);
        }
      } else {
        alert("Không tìm thấy địa chỉ cụ thể này. Hãy thử tìm tên Đường/Phường/Quận, sau đó kéo ghim đỏ trên bản đồ để chọn đúng số nhà nhé.");
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa chỉ:", error);
      alert("Lỗi tìm kiếm địa chỉ. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    onLatitudeChange(result.lat);
    onLongitudeChange(result.lon);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleMapChange = (newLat: number, newLng: number) => {
    onLatitudeChange(newLat.toString());
    onLongitudeChange(newLng.toString());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Tìm địa chỉ (VD: Đường 23, Hiệp Bình Phước)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <Button 
            type="button" 
            onClick={handleSearch} 
            disabled={isSearching}
          >
            {isSearching ? "Đang tìm..." : "Tìm"}
          </Button>
        </div>

        {searchResults.length > 1 && (
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            background: 'white', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {searchResults.map((result, index) => (
              <div 
                key={index}
                onClick={() => handleSelectResult(result)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📍 {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "300px", width: "100%", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
        <MapWithPin 
          latitude={lat} 
          longitude={lng} 
          onChange={handleMapChange} 
        />
      </div>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '-8px' }}>
        * Kéo thả ghim đỏ trên bản đồ để chọn vị trí chính xác của khu trọ.
      </p>

      <div>
        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '14px', padding: 0 }}
        >
          {showAdvanced ? "▼ Ẩn cài đặt tọa độ nâng cao" : "▶ Hiện cài đặt tọa độ nâng cao"}
        </button>
      </div>

      {showAdvanced && (
        <div style={{ display: 'flex', gap: '16px', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Vĩ độ (Latitude)</label>
            <Input
              placeholder="VD: 21.028511"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              type="number"
              step="any"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Kinh độ (Longitude)</label>
            <Input
              placeholder="VD: 105.804817"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              type="number"
              step="any"
            />
          </div>
        </div>
      )}
    </div>
  );
}
