"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Input } from "@/components/common";

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
}

export default function AddressLocationPicker({ 
  address, 
  onAddressChange, 
  latitude, 
  longitude, 
  onLatitudeChange, 
  onLongitudeChange 
}: AddressLocationPickerProps) {
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [street, setStreet] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(!!latitude && !!longitude);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []))
        .catch(err => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []))
        .catch(err => console.error("Error fetching wards:", err));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Update address string when components change
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && street) {
      const newAddress = `${street}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
      onAddressChange(newAddress);
    }
  }, [selectedProvince, selectedDistrict, selectedWard, street, onAddressChange]);

  const handleSearchMap = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !street) {
      alert("Vui lòng chọn đầy đủ thông tin địa chỉ trước khi tìm trên bản đồ.");
      return;
    }

    setIsSearching(true);
    setShowMap(true);
    
    // Create multiple levels of queries from specific to general
    const queries = [
      `${street}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}, Việt Nam`,
      `${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}, Việt Nam`,
      `${selectedDistrict.name}, ${selectedProvince.name}, Việt Nam`,
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
          value={selectedProvince?.code || ""}
          onChange={(e) => {
            const p = provinces.find(x => x.code == e.target.value);
            setSelectedProvince(p);
            setSelectedDistrict(null);
            setSelectedWard(null);
          }}
        >
          <option value="">-- Tỉnh / Thành phố --</option>
          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>

        <select 
          style={{ ...selectStyle, width: '100%' }}
          value={selectedDistrict?.code || ""}
          disabled={!selectedProvince}
          onChange={(e) => {
            const d = districts.find(x => x.code == e.target.value);
            setSelectedDistrict(d);
            setSelectedWard(null);
          }}
        >
          <option value="">-- Quận / Huyện --</option>
          {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
        </select>

        <select 
          style={{ ...selectStyle, width: '100%' }}
          value={selectedWard?.code || ""}
          disabled={!selectedDistrict}
          onChange={(e) => {
            const w = wards.find(x => x.code == e.target.value);
            setSelectedWard(w);
          }}
        >
          <option value="">-- Phường / Xã --</option>
          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>

        <Input 
          placeholder="Số nhà, tên đường (VD: 15 Đường 23)" 
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled={!selectedWard}
        />

        <Button 
          type="button" 
          onClick={handleSearchMap} 
          disabled={!selectedWard || !street || isSearching}
          style={{ width: '100%' }}
        >
          {isSearching ? "⏳ Đang định vị..." : "📍 Định vị trên Bản đồ"}
        </Button>

        {(selectedProvince && selectedDistrict && selectedWard && street) && (
          <p style={{ margin: 0, fontSize: '12px', color: '#28a745', fontWeight: 500, lineHeight: 1.5 }}>
            ✅ {street}, {selectedWard.name}, {selectedDistrict.name}, {selectedProvince.name}
          </p>
        )}

        {showMap && (
          <div>
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              {showAdvanced ? "▼ Ẩn tọa độ" : "▶ Tọa độ (nâng cao)"}
            </button>
            {showAdvanced && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', color: '#666' }}>Vĩ độ</label>
                  <Input value={latitude} readOnly style={{ background: '#f5f5f5', fontSize: '12px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', color: '#666' }}>Kinh độ</label>
                  <Input value={longitude} readOnly style={{ background: '#f5f5f5', fontSize: '12px' }} />
                </div>
              </div>
            )}
          </div>
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


