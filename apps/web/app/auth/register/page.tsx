"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, register } from "@/lib";
import type { AuthRole, AuthUser } from "@/lib";

type PublicRole = Exclude<AuthRole, "ADMIN">;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<PublicRole>("SEEKER");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUser(null);
    setIsSubmitting(true);

    try {
      const response = await register({
        email,
        password,
        fullName,
        role,
        ...(phone.trim() ? { phone: phone.trim() } : {})
      });

      setUser(response.user);

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Không thể tạo tài khoản"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-panel__header">
          <p>Smart Rental</p>
          <h1 id="register-title">Tạo tài khoản</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Họ và tên</span>
            <input
              autoComplete="name"
              name="fullName"
              onChange={(event) => setFullName(event.target.value)}
              required
              type="text"
              value={fullName}
            />
          </label>

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
            <span>Số điện thoại</span>
            <input
              autoComplete="tel"
              inputMode="tel"
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              pattern="^\+?\d{9,15}$"
              type="tel"
              value={phone}
            />
          </label>

          <label>
            <span>Loại tài khoản</span>
            <select
              name="role"
              onChange={(event) => setRole(event.target.value as PublicRole)}
              value={role}
            >
              <option value="SEEKER">Người tìm phòng</option>
              <option value="LANDLORD">Chủ trọ</option>
            </select>
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="auth-message auth-message--error">{error}</p> : null}
          {user ? (
            <p className="auth-message auth-message--success">
              Đăng ký thành công! Đang chuyển hướng...
            </p>
          ) : null}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
