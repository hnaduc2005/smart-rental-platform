"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/common";
import { apiRequest, getStoredAccessToken } from "@/lib";
import { toast } from "react-hot-toast";

export default function LandlordSettingsPage() {
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getStoredAccessToken();
      const profile = await apiRequest<any>("/landlords/my", { token });
      if (profile) {
        setBankName(profile.bankName || "");
        setBankAccountNumber(profile.bankAccountNumber || "");
        setBankAccountName(profile.bankAccountName || "");
        
        if (profile.bankName && profile.bankAccountNumber) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      }
    } catch (error: any) {
      toast.error("Lỗi tải thông tin: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getStoredAccessToken();
      await apiRequest("/landlords/my", {
        method: "PUT",
        body: {
          bankName,
          bankAccountNumber,
          bankAccountName
        },
        token
      });
      toast.success("Cập nhật thông tin thanh toán thành công!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Lỗi cập nhật: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Cài đặt tài khoản & Thanh toán</h2>
      
      <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Thông tin nhận tiền (Tài khoản ngân hàng)</h3>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
          Vui lòng cung cấp chính xác thông tin tài khoản ngân hàng của bạn. Thông tin này sẽ được hiển thị cho khách thuê khi họ thanh toán hóa đơn.
        </p>

        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-medium-gray)', marginBottom: 4 }}>Ngân hàng thụ hưởng</p>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--text-charcoal)' }}>{bankName}</p>
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-medium-gray)', marginBottom: 4 }}>Số tài khoản</p>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--text-charcoal)' }}>{bankAccountNumber}</p>
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-medium-gray)', marginBottom: 4 }}>Tên chủ tài khoản</p>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--text-charcoal)' }}>{bankAccountName}</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                Thay đổi thông tin
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Ngân hàng thụ hưởng</label>
              <Input 
                placeholder="VD: Vietcombank, Techcombank, MB Bank..." 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Số tài khoản</label>
              <Input 
                placeholder="VD: 0123456789" 
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Tên chủ tài khoản</label>
              <Input 
                placeholder="VD: NGUYEN VAN A" 
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thông tin ngân hàng"}
              </Button>
              {(bankName || bankAccountNumber) && (
                <Button type="button" variant="ghost" onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset to saved data on cancel
                }}>
                  Hủy
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
