"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken, type AuthUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

interface LandlordLayoutProps {
  children: ReactNode;
}

export default function LandlordLayout({ children }: LandlordLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchUserData = () => {
      const token = getStoredAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      getCurrentUser(token as string)
        ?.then((data) => {
          if (!data || data.role !== "LANDLORD") {
            router.push("/login");
          } else {
            setUser(data);
            // Lấy số lượng yêu cầu thuê đang chờ xử lý và chưa đọc
            apiRequest<any[]>("/rental-requests/my", { token: token as string })
              .then((requests) => {
                const lastSeenStr = localStorage.getItem("lastSeenRentalRequestsAt");
                const lastSeenTime = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;

                const unreadPending = requests.filter((r) => {
                  if (r.status !== "PENDING") return false;
                  const createdAtTime = new Date(r.createdAt).getTime();
                  return createdAtTime > lastSeenTime;
                }).length;

                setPendingRequests(unreadPending);
              })
              .catch((err) => console.error("Failed to load rental requests count:", err));
          }
        })
        .catch(() => {
          router.push("/login");
        })
        ?.finally(() => {
          setIsLoading(false);
        });
    };

    fetchUserData();

    window.addEventListener('profileUpdated', fetchUserData);
    return () => window.removeEventListener('profileUpdated', fetchUserData);
  }, [router]);

  // Check token existence on route changes and clear badge if visiting rental-requests
  useEffect(() => {
    if (!isLoading && !getStoredAccessToken()) {
      router.push("/login");
    }

    // Nếu người dùng vào trang yêu cầu thuê, cập nhật thời gian đã xem và xóa badge
    if (pathname === "/landlord/rental-requests") {
      localStorage.setItem("lastSeenRentalRequestsAt", new Date().toISOString());
      setPendingRequests(0);
    }
  }, [pathname, router, isLoading]);

  function handleLogout() {
    clearStoredAccessToken();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/landlord/dashboard", icon: "📊" },
    { label: "Khu trọ / Nhà trọ", href: "/landlord/properties", icon: "🏢" },
    { label: "Phòng trọ", href: "/landlord/rooms", icon: "🔑" },
    { label: "Lịch xem phòng", href: "/landlord/viewing-appointments", icon: "📅" },
    { label: "Yêu cầu thuê", href: "/landlord/rental-requests", icon: "📩" },
    { label: "Hợp đồng", href: "/landlord/contracts", icon: "📄" },
    { label: "Khách thuê", href: "/landlord/tenants", icon: "👥" },
    { label: "Hóa đơn", href: "/landlord/invoices", icon: "🧾" },
    { label: "Báo cáo sự cố", href: "/landlord/reports", icon: "⚠️" },
    { label: "Cài đặt", href: "/landlord/settings", icon: "⚙️" },
  ];

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <a href="/landlord/dashboard" className={styles.brand}>
          <div className={styles.logoIcon}>S</div>
          <div className={styles.brandTextContainer}>
            <span className={styles.logoText}>SmartRental</span>
            <span className={styles.logoSubtext}>Nền tảng thuê trọ thông minh</span>
          </div>
        </a>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.href === "/landlord/rental-requests" && pendingRequests > 0 && (
                  <span style={{ background: "var(--color-error)", color: "white", fontSize: "12px", fontWeight: "bold", padding: "2px 8px", borderRadius: "12px", marginLeft: "auto" }}>
                    {pendingRequests}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area with User Info and Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUserBlock}>
            <div className={styles.sidebarAvatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                user?.fullName ? user.fullName.charAt(0).toUpperCase() : "L"
              )}
            </div>
            <div className={styles.sidebarUserInfo}>
              <p className={styles.sidebarUserName}>{user?.fullName || user?.email}</p>
              <span className={styles.sidebarRoleBadge}>
                {user?.role === "LANDLORD" ? "Chủ trọ" : user?.role}
              </span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Navbar */}
        <header className={styles.topNav}>
          <div>
            <h1 className={styles.topNavTitle}>KÊNH QUẢN LÝ CHỦ TRỌ</h1>
          </div>
        </header>

        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
