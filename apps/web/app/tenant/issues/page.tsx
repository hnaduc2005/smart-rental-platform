"use client";

import React, { useState, useEffect } from "react";
import { Badge, Button } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { ISSUE_STATUS_MAP, translateStatus } from "@/lib/status-translators";
import styles from "./page.module.css";
import { toast } from "react-hot-toast";

export default function TenantIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    contractId: "",
    type: "",
    title: "",
    description: "",
    imageUrl: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getStoredAccessToken();
      const [issuesData, contractsData] = await Promise.all([
        apiRequest<any[]>("/issue-reports/tenant/my", { token }),
        apiRequest<any[]>("/contracts/tenant/my", { token })
      ]);
      setIssues(issuesData);
      setContracts(contractsData);
      
      // Auto select first contract if available
      if (contractsData.length > 0) {
        setFormData(prev => ({ ...prev, contractId: contractsData[0].id }));
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractId || !formData.type || !formData.title) {
      toast.error("Vui lòng điền đầy đủ Phòng, Loại sự cố và Tiêu đề!");
      return;
    }

    const selectedContract = contracts.find(c => c.id === formData.contractId);
    if (!selectedContract) return;

    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/issue-reports", {
        method: "POST",
        body: {
          roomId: selectedContract.roomId,
          contractId: selectedContract.id,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl
        },
        token
      });
      toast.success("Gửi báo cáo thành công!");
      setFormData(prev => ({ ...prev, title: "", description: "", imageUrl: "" })); // reset some fields
      setImagePreview(null);
      fetchData(); // reload
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getStatusBadge = (status: string) => {
    let variant: "warning" | "success" | "error" | "info" = "info";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "OPEN" || upperStatus === "PENDING") variant = "warning";
    else if (upperStatus === "IN_PROGRESS") variant = "info";
    else if (upperStatus === "RESOLVED" || upperStatus === "CLOSED") variant = "success";
    else if (upperStatus === "REJECTED") variant = "error";
    return <Badge variant={variant}>{translateStatus(upperStatus === "PENDING" ? "OPEN" : upperStatus, ISSUE_STATUS_MAP)}</Badge>;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Báo cáo sự cố</h1>

      <div className={styles.grid}>
        {/* Cột trái: Form tạo báo cáo */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Gửi yêu cầu hỗ trợ mới</h2>

            <form onSubmit={handleSubmit}>
              {contracts.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phòng đang ở</label>
                  <select 
                    className={styles.select}
                    value={formData.contractId}
                    onChange={e => setFormData({...formData, contractId: e.target.value})}
                  >
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.room?.name} ({c.room?.property?.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Loại sự cố</label>
                <select 
                  className={styles.select}
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="ELECTRICITY">Sự cố về Điện</option>
                  <option value="WATER">Sự cố về Nước</option>
                  <option value="INTERNET">Internet / Wifi</option>
                  <option value="SANITATION">Vệ sinh chung</option>
                  <option value="SECURITY">An ninh / Trật tự</option>
                  <option value="EQUIPMENT">Thiết bị (Điều hòa, Nóng lạnh...)</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Hỏng vòi nước nhà vệ sinh"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả chi tiết</label>
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả rõ tình trạng để chủ trọ chuẩn bị dụng cụ sửa chữa phù hợp..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Đính kèm hình ảnh (nếu có)</label>
                <label className={styles.uploadBox} htmlFor="issue-image-upload" style={{ cursor: 'pointer' }}>
                  <input
                    id="issue-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {!imagePreview ? (
                    <>
                      <span style={{ fontSize: "24px" }}>📸</span>
                      <span style={{ fontSize: "14px", color: "var(--text-dark-gray)" }}>
                        Bấm để chọn ảnh minh họa sự cố
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-dark-gray)" }}>
                        Hỗ trợ JPG, PNG, GIF
                      </span>
                    </>
                  ) : (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setImagePreview(null); setFormData(prev => ({ ...prev, imageUrl: "" })); }}
                        style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div style={{ marginTop: "24px" }}>
                <Button variant="primary" fullWidth disabled={isSubmitting || contracts.length === 0}>
                  {isSubmitting ? "Đang gửi..." : "Gửi báo cáo cho Chủ trọ"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Cột phải: Lịch sử báo cáo */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lịch sử yêu cầu</h2>

            <div className={styles.historyList}>
              {loading ? (
                <p>Đang tải...</p>
              ) : issues.length === 0 ? (
                <p>Chưa có báo cáo sự cố nào.</p>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className={styles.historyItem}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{issue.title}</h3>
                      {getStatusBadge(issue.status.toLowerCase())}
                    </div>

                    <div className={styles.itemBody}>
                      <div className={styles.itemMeta}>
                        <span>Danh mục: {issue.type}</span>
                        <span>•</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>

                      <p className={styles.itemDesc}>{issue.description}</p>
                      {issue.imageUrl && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark-gray)', marginBottom: '4px' }}>Ảnh đính kèm:</p>
                          <img src={issue.imageUrl} alt="Minh chứng sự cố" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
