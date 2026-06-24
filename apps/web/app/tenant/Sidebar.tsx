"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

const menuItems = [
  {
    group: "Quản lý chung",
    items: [
      { name: "Tổng quan", path: "/tenant/dashboard", icon: "📊" },
    ]
  },
  {
    group: "Quản lý thuê",
    items: [
      { name: "Phòng của tôi", path: "/tenant/my-room", icon: "🏠" },
      { name: "Lịch sử yêu cầu", path: "/tenant/requests", icon: "📝" },
      { name: "Hóa đơn", path: "/tenant/invoices", icon: "🧾" },
      { name: "Thanh toán", path: "/tenant/payments", icon: "💳" },
    ]
  },
  {
    group: "Tương tác",
    items: [
      { name: "Báo cáo sự cố", path: "/tenant/issues", icon: "🛠️" },
      { name: "Đánh giá", path: "/tenant/reviews", icon: "⭐" },
    ]
  },
  {
    group: "Cá nhân",
    items: [
      { name: "Yêu thích", path: "/tenant/wishlist", icon: "❤️" },
      { name: "Cài đặt", path: "/tenant/settings", icon: "⚙️" },
    ]
  }
];

export default function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const fetchProfile = () => {
    const token = getStoredAccessToken();
    if (token) {
      getCurrentUser(token).then(setUser).catch(() => setUser(null));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchProfile();

    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    clearStoredAccessToken();
    router.push("/login");
  };

  const avatarLetter = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "T";

  return (
    <>
      {/* Nút mở menu trên Mobile */}
      <button className={styles.mobileMenuBtn} onClick={toggleSidebar}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Lớp mờ background trên Mobile khi mở menu */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`} 
        onClick={toggleSidebar}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        {/* Logo/Brand Area */}
        <Link href="/" className={styles.sidebarBrand} style={{ textDecoration: 'none' }}>
          <div className={styles.logoIcon}>S</div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>SmartRental</span>
            <span className={styles.brandSlogan}>Nền tảng thuê trọ thông minh</span>
          </div>
        </Link>

        {/* Menu Items */}
        <div className={styles.sidebarMenuArea}>
          {menuItems.map((group, index) => (
            <div key={index}>
              <div className={styles.sidebarTitle}>{group.group}</div>
              <ul className={styles.menuList}>
                {group.items.map((item) => {
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path} 
                        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ""}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className={styles.icon}>{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Area with User Info and Logout */}
        <div className={styles.sidebarFooter}>
          {/* User Info Block (Moved to bottom) */}
          <div className={styles.sidebarUserBlock}>
            <div className={styles.sidebarAvatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                avatarLetter
              )}
            </div>
            <div className={styles.sidebarUserInfo}>
              <p className={styles.sidebarUserName}>{user?.fullName || "Khách thuê"}</p>
              <span className={styles.sidebarRoleBadge}>
                {user?.role === "TENANT" ? "Người thuê" : 
                 user?.role === "SEEKER" ? "Người tìm phòng" : user?.role ?? "Tenant"}
              </span>
            </div>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
