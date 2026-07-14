"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import { ApiError, resetPassword } from "@/lib";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordLoading() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="auth-message auth-message--success">Đang tải thông tin khôi phục mật khẩu...</p>
      </section>
    </main>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(token ? null : "Liên kết khôi phục mật khẩu không hợp lệ.");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Liên kết khôi phục mật khẩu không hợp lệ.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, newPassword });
      setSuccessMessage(`${response.message}. Đang chuyển về trang đăng nhập...`);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="reset-password-title">
        <div className="auth-panel__header">
          <p>Smart Rental</p>
          <h1 id="reset-password-title">Đặt lại mật khẩu</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Mật khẩu mới</span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                autoComplete="new-password"
                minLength={8}
                name="newPassword"
                onChange={(event) => setNewPassword(event.target.value)}
                required
                style={{ width: "100%", paddingRight: "64px" }}
                type={showPassword ? "text" : "password"}
                value={newPassword}
              />
              <button
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((value) => !value)}
                style={{
                  position: "absolute",
                  right: "10px",
                  display: "grid",
                  placeItems: "center",
                  width: "32px",
                  minHeight: "32px",
                  border: 0,
                  padding: 0,
                  background: "transparent",
                  color: "#475569",
                  cursor: "pointer"
                }}
                type="button"
              >
                {showPassword ? (
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </label>

          <label>
            <span>Xác nhận mật khẩu mới</span>
            <input
              autoComplete="new-password"
              minLength={8}
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
            />
          </label>

          {error ? <p className="auth-message auth-message--error">{error}</p> : null}
          {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}

          <button disabled={isSubmitting || !token} type="submit">
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        <p className="auth-switch">
          Nhớ mật khẩu? <Link href="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
