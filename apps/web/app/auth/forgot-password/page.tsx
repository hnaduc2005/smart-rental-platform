"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { ApiError, forgotPassword } from "@/lib";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email });
      setSuccessMessage(response.message);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="forgot-password-title">
        <div className="auth-panel__header">
          <p>Smart Rental</p>
          <h1 id="forgot-password-title">Quên mật khẩu</h1>
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

          {error ? <p className="auth-message auth-message--error">{error}</p> : null}
          {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}


          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>

        <p className="auth-switch">
          Nhớ mật khẩu? <Link href="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
