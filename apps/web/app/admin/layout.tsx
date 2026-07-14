"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken, AuthUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar, pageLabelMap } from "@/components/admin/AdminTopbar";
import "@/components/admin/admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    getCurrentUser(token)
      ?.then((data) => {
        if (!data || data.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        setAdminUser(data);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  // Re-check on path change
  useEffect(() => {
    if (!isLoading && !getStoredAccessToken()) {
      router.push("/login");
    }
  }, [pathname, router, isLoading]);

  const handleLogout = () => {
    clearStoredAccessToken();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="admin-loading-page">
        <div className="admin-loading-spinner" />
        <span className="admin-loading-text">Đang tải trang quản trị...</span>
      </div>
    );
  }

  const pageLabel = pageLabelMap[pathname] ?? "Admin";

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={handleLogout} />
      <div className="admin-main">
        <AdminTopbar pageLabel={pageLabel} adminEmail={adminUser?.email} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
