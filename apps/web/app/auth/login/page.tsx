"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib";
import type { AuthUser } from "@/lib";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUser(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      setUser(response.user);

      setTimeout(() => {
        if (response.user.role === "LANDLORD") {
          router.push("/landlord/dashboard");
        } else if (response.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }, 1000);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Unable to sign in"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-panel__header">
          <p>Smart Rental</p>
          <h1 id="login-title">Sign in</h1>
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
            <span>Password</span>
            <input
              autoComplete="current-password"
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
              Signed in as {user.email}. Status: {user.status}
            </p>
          ) : null}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link href="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
