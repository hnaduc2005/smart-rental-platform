"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Input } from "@/components/common";
import { apiRequest } from "@/lib";

const MapWithPin = dynamic(() => import("./MapWithPin"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", borderRadius: "8px" }}>Đang tải bản đồ...</div>
});

interface AddressLocationPickerProps {
  address: string;
  onAddressChange: (val: string) => void;
  latitude: number | string;
  longitude: number | string;
  onLatitudeChange: (val: string) => void;
  onLongitudeChange: (val: string) => void;
  regionId?: string | null;
  onRegionIdChange?: (val: string | null) => void;
}

export default function AddressLocationPicker({ 
  address, 
  onAddressChange, 
  latitude, 
  longitude, 
  onLatitudeChange, 
  onLongitudeChange,
  regionId,
  onRegionIdChange
}: AddressLocationPickerProps) {
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [street, setStreet] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(!!latitude && !!longitude);

  // Parse existing address to populate street if possible (simplistic)
  useEffect(() => {
    if (address && !street && !selectedProvince) {
      const parts = address.split(',').map(s => s.trim());
      if (parts.length > 0) {
        setStreet(parts[0]);
      }
    }
  }, [address]);

  // Fetch provinces from OUR backend
  useEffect(() => {
    apiRequest<any[]>("/regions/provinces")
      .then(data => setProvinces(data))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      apiRequest<any[]>(`/regions/provinces/${selectedProvince.id}/districts`)
        .then(data => setDistricts(data))
        .catch(err => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Update address string and regionId when components change
  useEffect(() => {
    if (selectedProvince && selectedDistrict && street) {
      const newAddress = `${street}, ${selectedDistrict.name}, ${selectedProvince.name}`;
      onAddressChange(newAddress);
      if (onRegionIdChange) {
        onRegionIdChange(selectedDistrict.id || selectedProvince.id);
      }
    }
  }, [selectedProvince, selectedDistrict, street, onAddressChange, onRegionIdChange]);

  const handleSearchMap = async () => {
    if (!selectedProvince || !selectedDistrict || !street) {
      alert("Vui lòng chọn đầy đủ thông tin địa chỉ trước khi tìm trên bản đồ.");
      return;
    }

    setIsSearching(true);
    setShowMap(true);
    
    // Hàm làm sạch chuỗi (Bỏ các từ khóa dễ làm rối Nominatim và lấy phần chính)
    const cleanText = (text: string) => {
      if (!text) return "";
      return text.replace(/(Thành phố|Tỉnh|Quận|Huyện|Thị xã|Phường|Xã)\s+/gi, "").trim();
    };

    // Nếu người dùng nhập cả chuỗi dài vào ô số nhà, cố gắng lấy phần đầu tiên (thường là số nhà + tên đường)
    const shortStreet = street.split(',')[0].trim();

    // Create multiple levels of queries from specific to general
    const queries = [
      // 1. Dạng đầy đủ nhất người dùng nhập
      `${street}, ${selectedDistrict.name}, ${selectedProvince.name}, Việt Nam`,
      // 2. Dạng đã được làm sạch từ khóa hành chính
      `${shortStreet}, ${cleanText(selectedDistrict.name)}, ${cleanText(selectedProvince.name)}, Việt Nam`,
      // 3. Chỉ lấy đường + Quận + Tỉnh (bỏ qua phường/xã nếu có trong street)
      `${shortStreet}, ${selectedDistrict.name}, ${selectedProvince.name}`,
      // 4. Chỉ tìm Quận / Huyện
      `${selectedDistrict.name}, ${selectedProvince.name}, Việt Nam`,
      // 5. Chỉ tìm Tỉnh / Thành phố
      `${selectedProvince.name}, Việt Nam`
    ];

    try {
      let foundData = null;
      let queryLevel = 0;

      for (let i = 0; i < queries.length; i++) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queries[i])}&limit=1&countrycodes=vn`, {
          headers: { "Accept-Language": "vi-VN,vi;q=0.9", "User-Agent": "SmartRentalPlatform/1.0" }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
          foundData = data[0];
          queryLevel = i;
          break;
        }
      }

      if (foundData) {
        onLatitudeChange(foundData.lat);
        onLongitudeChange(foundData.lon);
        
        if (queryLevel > 0) {
           // Nếu không tìm thấy chính xác số nhà/phường, thông báo để người dùng biết
           alert("Không tìm thấy vị trí chính xác tuyệt đối. Bản đồ đã được đưa về khu vực gần nhất. Vui lòng kéo thả ghim đỏ vào đúng nhà của bạn!");
        }
      } else {
        alert("Bản đồ không thể định vị tự động khu vực này. Vui lòng tự di chuyển bản đồ và thả ghim đỏ vào đúng vị trí.");
      }
    } catch (error) {
      console.error("Lỗi định vị:", error);
      alert("Lỗi kết nối định vị. Hãy thử lại.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapChange = (newLat: number, newLng: number) => {
    onLatitudeChange(newLat.toString());
    onLongitudeChange(newLng.toString());
  };

  const selectStyle = {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border-color, #d9d9d9)',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'white'
  };

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

      {/* Cột trái: Chọn địa chỉ */}
      <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#495057' }}>📋 Chọn địa chỉ</h4>
        
        <select 
          style={{ ...selectStyle, width: '100%' }}
          value={selectedProvince?.id || ""}
          onChange={(e) => {
            const p = provinces.find(x => x.id === e.target.value);
            setSelectedProvince(p);
            setSelectedDistrict(null);
          }}
        >
          <option value="">-- Tỉnh / Thành phố --</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select 
          style={{ ...selectStyle, width: '100%' }}
          value={selectedDistrict?.id || ""}
          disabled={!selectedProvince}
          onChange={(e) => {
            const d = districts.find(x => x.id === e.target.value);
            setSelectedDistrict(d);
          }}
        >
          <option value="">-- Quận / Huyện --</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <Input 
          placeholder="Số nhà, tên đường, phường (VD: 15 Đường 23, P. Bình Trưng Đông)" 
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled={!selectedDistrict}
        />

        <Button 
          type="button" 
          onClick={handleSearchMap} 
          disabled={!selectedDistrict || !street || isSearching}
          style={{ width: '100%' }}
        >
          {isSearching ? "⏳ Đang định vị..." : "📍 Định vị trên Bản đồ"}
        </Button>

        {(selectedProvince && selectedDistrict && street) && (
          <p style={{ margin: 0, fontSize: '12px', color: '#28a745', fontWeight: 500, lineHeight: 1.5 }}>
            ✅ {street}, {selectedDistrict.name}, {selectedProvince.name}
          </p>
        )}
      </div>

      {/* Cột phải: Bản đồ */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#495057' }}>
          🗺️ Bản đồ <span style={{ color: '#dc3545', fontWeight: 'normal', fontSize: '11px' }}>— Kéo ghim đỏ vào đúng nóc nhà</span>
        </h4>
        <div style={{ height: "280px", width: "100%", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", position: "relative", zIndex: 0 }}>
          <MapWithPin 
            latitude={Number(latitude) || 10.845} 
            longitude={Number(longitude) || 106.773} 
            onChange={handleMapChange} 
          />
        </div>
        {!showMap && (
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
            Chọn địa chỉ và bấm "Định vị" để bản đồ tự điều hướng về khu vực của bạn.
          </p>
        )}
      </div>

    </div>
  );
}


