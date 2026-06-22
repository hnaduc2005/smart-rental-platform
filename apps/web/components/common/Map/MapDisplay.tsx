"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapWithPin = dynamic(() => import("./MapWithPin"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", borderRadius: "8px" }}>Đang tải bản đồ...</div>
});

interface MapDisplayProps {
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
  address?: string;
  height?: string;
}

export default function MapDisplay({ latitude, longitude, address, height = "300px" }: MapDisplayProps) {
  if (!latitude || !longitude) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", borderRadius: "8px", color: "#666", flexDirection: "column", padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: "24px", marginBottom: "8px" }}>🗺️</p>
        <p>Vị trí chưa được cập nhật trên bản đồ.</p>
        {address && <p style={{ fontSize: "14px", marginTop: "4px" }}>Địa chỉ: {address}</p>}
      </div>
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <div style={{ height, width: "100%", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", position: "relative", zIndex: 0 }}>
      <MapWithPin 
        latitude={lat} 
        longitude={lng} 
        onChange={() => {}} 
        readOnly={true}
      />
    </div>
  );
}
