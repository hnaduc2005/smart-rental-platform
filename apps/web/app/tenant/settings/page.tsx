'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from '@/components/common';
import styles from './page.module.css';
import { getCurrentUser, updateProfile as updateProfileApi, changePassword } from '@/lib/auth';

export default function TenantSettingsPage() {
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: ''
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load from API on mount
  useEffect(() => {
    const userPromise = getCurrentUser();
    if (userPromise) {
      userPromise.then(user => {
        if (user) {
          setProfile({
            fullName: user.fullName || '',
            phone: user.phone || '',
            email: user.email || ''
          });
          if (user.avatarUrl) {
            setAvatarPreview(user.avatarUrl);
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Password form state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({
    current: '',
    newPw: '',
    confirm: ''
  });
  const [pwErrors, setPwErrors] = useState<{ current?: string; newPw?: string; confirm?: string }>({});
  const [pwSuccess, setPwSuccess] = useState(false);

  // Profile success
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    emailMatch: true,
    smsUpdate: false,
    promo: true
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfileApi({
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: avatarPreview || undefined
      });
      
      // Dispatch event so Sidebar can update in real-time
      window.dispatchEvent(new Event('profileUpdated'));

      setIsEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 for localstorage persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      // We don't save to localStorage yet until they click Save changes
    };
    reader.readAsDataURL(file);
  };

  // Password validation — theo đúng chuẩn hệ thống: minLength 8
  const handleChangePassword = () => {
    const errors: typeof pwErrors = {};

    if (!pwForm.current) {
      errors.current = 'Vui lòng nhập mật khẩu hiện tại.';
    }

    if (!pwForm.newPw) {
      errors.newPw = 'Vui lòng nhập mật khẩu mới.';
    } else if (pwForm.newPw.length < 8) {
      errors.newPw = 'Mật khẩu phải có ít nhất 8 ký tự.';
    } else if (pwForm.newPw === pwForm.current) {
      errors.newPw = 'Mật khẩu mới không được trùng mật khẩu hiện tại.';
    }

    if (!pwForm.confirm) {
      errors.confirm = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (pwForm.confirm !== pwForm.newPw) {
      errors.confirm = 'Mật khẩu xác nhận không khớp.';
    }

    setPwErrors(errors);

    if (Object.keys(errors).length === 0) {
      changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw
      }).then(() => {
        // Thành công — reset form
        setPwForm({ current: '', newPw: '', confirm: '' });
        setIsChangingPassword(false);
        setPwSuccess(true);
        setTimeout(() => setPwSuccess(false), 3000);
      }).catch((err) => {
        if (err.message?.includes('hiện tại không chính xác')) {
          setPwErrors({ current: 'Mật khẩu hiện tại không chính xác.' });
        } else {
          setPwErrors({ current: 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại.' });
        }
      });
    }
  };

  return (
    <div className={styles.content}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px 0', color: 'var(--text-charcoal)' }}>
        Cài đặt tài khoản
      </h1>

      {/* Profile Edit Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>

        <div className={styles.avatarUpload}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
            disabled={!isEditingProfile}
          />
          <div className={styles.avatarPreview}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              profile.fullName.charAt(0)
            )}
          </div>
          <div>
            <Button
              variant="secondary"
              style={{ marginBottom: '8px' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={!isEditingProfile}
            >
              Tải ảnh mới lên
            </Button>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-medium-gray)' }}>JPG, GIF hoặc PNG. Tối đa 2MB.</p>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Họ và tên</label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={!isEditingProfile}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại</label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditingProfile}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ Email</label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled
            />
          </div>
        </div>

        {profileSuccess && (
          <div className={styles.successBanner}>✅ Đã cập nhật thông tin thành công!</div>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isEditingProfile ? (
            <Button variant="secondary" onClick={() => setIsEditingProfile(true)}>Thay đổi thông tin</Button>
          ) : (
            <>
              <Button variant="primary" onClick={handleSaveProfile}>Lưu thay đổi</Button>
              <Button variant="secondary" onClick={() => setIsEditingProfile(false)}>Hủy</Button>
            </>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Bảo mật & Mật khẩu</h2>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu hiện tại</label>
            <Input
              type="password"
              placeholder={isChangingPassword ? "Nhập mật khẩu hiện tại" : "••••••••"}
              value={isChangingPassword ? pwForm.current : "********"}
              disabled={!isChangingPassword}
              onChange={(e) => {
                setPwForm({ ...pwForm, current: e.target.value });
                setPwErrors({ ...pwErrors, current: undefined });
              }}
            />
            {pwErrors.current && <span className={styles.errorText}>{pwErrors.current}</span>}
          </div>
        </div>

        {isChangingPassword && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu mới</label>
              <Input
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                value={pwForm.newPw}
                onChange={(e) => {
                  setPwForm({ ...pwForm, newPw: e.target.value });
                  setPwErrors({ ...pwErrors, newPw: undefined });
                }}
              />
              {pwErrors.newPw && <span className={styles.errorText}>{pwErrors.newPw}</span>}
              {/* Strength indicator */}
              {pwForm.newPw.length > 0 && (
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: pwForm.newPw.length >= 12 ? '100%' : pwForm.newPw.length >= 8 ? '60%' : '25%',
                      background: pwForm.newPw.length >= 12 ? 'var(--color-success, #16a34a)' : pwForm.newPw.length >= 8 ? '#f59e0b' : 'var(--color-error, #dc2626)'
                    }}
                  />
                  <span className={styles.strengthLabel}>
                    {pwForm.newPw.length >= 12 ? 'Mạnh' : pwForm.newPw.length >= 8 ? 'Trung bình' : 'Yếu'}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Xác nhận mật khẩu mới</label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={pwForm.confirm}
                onChange={(e) => {
                  setPwForm({ ...pwForm, confirm: e.target.value });
                  setPwErrors({ ...pwErrors, confirm: undefined });
                }}
              />
              {pwErrors.confirm && <span className={styles.errorText}>{pwErrors.confirm}</span>}
            </div>
          </div>
        )}

        {pwSuccess && (
          <div className={styles.successBanner}>✅ Đổi mật khẩu thành công!</div>
        )}
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isChangingPassword ? (
            <Button variant="secondary" onClick={() => setIsChangingPassword(true)}>Thay đổi mật khẩu</Button>
          ) : (
            <>
              <Button variant="primary" onClick={handleChangePassword}>Lưu thay đổi</Button>
              <Button variant="secondary" onClick={() => {
                setIsChangingPassword(false);
                setPwForm({ current: '', newPw: '', confirm: '' });
                setPwErrors({});
              }}>Hủy</Button>
            </>
          )}
        </div>
      </section>

      {/* Notifications Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tùy chọn thông báo</h2>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <h4>Email phòng trọ mới</h4>
            <p>Nhận email khi có phòng mới phù hợp với tìm kiếm của bạn.</p>
          </div>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={notifications.emailMatch}
              onChange={(e) => setNotifications({ ...notifications, emailMatch: e.target.checked })}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <h4>SMS cập nhật trạng thái</h4>
            <p>Nhận tin nhắn SMS khi yêu cầu đặt phòng được phê duyệt.</p>
          </div>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={notifications.smsUpdate}
              onChange={(e) => setNotifications({ ...notifications, smsUpdate: e.target.checked })}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <h4>Khuyến mãi & Tin tức</h4>
            <p>Nhận thông tin về các chương trình ưu đãi từ SmartRental.</p>
          </div>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={notifications.promo}
              onChange={(e) => setNotifications({ ...notifications, promo: e.target.checked })}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </section>
    </div>
  );
}
