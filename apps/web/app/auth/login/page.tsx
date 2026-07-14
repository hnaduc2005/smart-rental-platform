"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login, getCurrentUser, getStoredAccessToken } from "@/lib";
import type { AuthUser } from "@/lib";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      getCurrentUser(token)
        ?.then((data) => {
          if (data) {
            setIsRedirecting(true);
            redirectByRole(data.role);
          } else {
            setIsCheckingSession(false);
          }
        })
        .catch(() => {
          setIsCheckingSession(false);
        });
    } else {
      setIsCheckingSession(false);
    }
  }, []);

  const redirectByRole = (role: string) => {
    if (role === "LANDLORD") {
      router.push("/landlord/dashboard");
    } else if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "TENANT") {
      router.push("/tenant/dashboard");
    } else {
      router.push("/");
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUser(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      setUser(response.user);

      setTimeout(() => {
        redirectByRole(response.user.role);
      }, 1000);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Không thể đăng nhập"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-deep-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-charcoal)', fontWeight: 500 }}>
          {isRedirecting ? 'Đang chuyển hướng...' : 'Đang kiểm tra phiên đăng nhập...'}
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-panel__header">
          <p>Smart Rental</p>
          <h1 id="login-title">Đăng nhập</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={password}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  padding: "4px"
                }}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '10px' }}>
            <Link href="/auth/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--color-primary, #0056b3)', textDecoration: 'none' }}>Quên mật khẩu?</Link>
          </div>

          {error ? <p className="auth-message auth-message--error">{error}</p> : null}
          {user ? (
            <p className="auth-message auth-message--success">
              Đăng nhập thành công! Đang chuyển hướng...
            </p>
          ) : null}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
