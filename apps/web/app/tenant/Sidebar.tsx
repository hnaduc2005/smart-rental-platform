"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

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
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

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
                      onClick={() => setIsOpen(false)} // Tự đóng khi click (trên mobile)
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
      </aside>
    </>
  );
}
