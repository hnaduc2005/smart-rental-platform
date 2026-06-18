"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    getCurrentUser(token as string)
      ?.then((data) => {
        if (!data || data.role !== "ADMIN") {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      })
      ?.finally(() => {
        setIsLoading(false);
      });
  }, [router]);

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
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading Admin Dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Basic Admin Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#1f2937", color: "white", padding: "24px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "32px", borderBottom: "1px solid #374151", paddingBottom: "16px" }}>Admin Panel</h2>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          <a href="/admin/dashboard" style={{ color: "white", textDecoration: "none", fontSize: "16px", padding: "8px", borderRadius: "4px" }}>Dashboard</a>
          <a href="/admin/users" style={{ color: "white", textDecoration: "none", fontSize: "16px", padding: "8px", borderRadius: "4px" }}>Users</a>
          <a href="/admin/room-posts" style={{ color: "white", textDecoration: "none", fontSize: "16px", padding: "8px", borderRadius: "4px" }}>Room Posts</a>
        </nav>

        <button 
          onClick={handleLogout}
          style={{ marginTop: "auto", padding: "12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}
