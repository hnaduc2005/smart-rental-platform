"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import styles from "./properties.module.css";
import { toast } from "react-hot-toast";

interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  rooms?: any[];
}

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = getStoredAccessToken();
      const data = await apiRequest<Property[]>("/properties/my", { token });
      setProperties(data);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleOpenCreateModal = () => {
    setEditingProperty(null);
    setName("");
    setAddress("");
    setDescription("");
    setLatitude("");
    setLongitude("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (property: Property) => {
    setEditingProperty(property);
    setName(property.name);
    setAddress(property.address);
    setDescription(property.description);
    setLatitude(property.latitude?.toString() || "");
    setLongitude(property.longitude?.toString() || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setIsSubmitting(true);

    try {
      const token = getStoredAccessToken();
      const payload = { 
        name, 
        address, 
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      if (editingProperty) {
        // Edit
        await apiRequest(`/properties/${editingProperty.id}`, {
          method: "PUT",
          body: payload,
          token
        });
      } else {
        // Create
        await apiRequest("/properties", {
          method: "POST",
          body: payload,
          token
        });
      }
      
      setIsModalOpen(false);
      fetchProperties(); // Reload data
    } catch (error: any) {
      toast.error("Lỗi lưu dữ liệu: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khu trọ này không?")) {
      try {
        const token = getStoredAccessToken();
        await apiRequest(`/properties/${id}`, {
          method: "DELETE",
          token
        });
        setProperties(properties.filter((p) => p.id !== id));
      } catch (error: any) {
        toast.error("Lỗi xóa dữ liệu: " + error.message);
      }
    }
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Khu trọ / Nhà trọ của tôi</h2>
        <Button onClick={handleOpenCreateModal}>
          ➕ Thêm khu trọ mới
        </Button>
      </div>

      <div className={styles.grid}>
        {properties.map((property) => (
          <div key={property.id} className={styles.card}>
            <div>
              <div className={styles.cardHeader}>
                <h3 className={styles.propertyName}>{property.name}</h3>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.address}>📍 {property.address}</p>
                <p className={styles.description}>{property.description}</p>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.roomsCountBadge}>
                🏢 {property.rooms?.length || 0} phòng
              </span>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={() => handleOpenEditModal(property)}
                  style={{ height: "32px", padding: "0 12px" }}
                >
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(property.id)}
                  style={{ color: "var(--color-error)" }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProperty ? "Chỉnh sửa khu trọ" : "Thêm khu trọ mới"}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên khu trọ *</label>
                  <Input
                    placeholder="VD: Nhà trọ Thanh Xuân"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Địa chỉ *</label>
                  <Input
                    placeholder="VD: Số 12, Ngõ 45, Khương Trung..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>
                      Vĩ độ (Latitude) 
                      <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#0066cc', marginLeft: '8px' }}>(Lấy từ Google Maps)</a>
                    </label>
                    <Input
                      placeholder="VD: 21.028511"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>Kinh độ (Longitude)</label>
                    <Input
                      placeholder="VD: 105.804817"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mô tả chi tiết</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Nhập thông tin mô tả chi tiết, an ninh, tiện ích chung..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu lại"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
