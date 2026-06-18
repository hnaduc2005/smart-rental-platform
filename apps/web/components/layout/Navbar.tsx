'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import styles from './Navbar.module.css';
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

const navLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Tìm phòng', href: '/rooms' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      getCurrentUser(token)
        ?.then((data) => {
          if (data) setUser(data);
        })
        .finally(() => setIsAuthChecking(false));
    } else {
      setIsAuthChecking(false);
    }
  }, [pathname]); // Re-check when route changes, just in case

  const handleLogout = () => {
    clearStoredAccessToken();
    setUser(null);
    router.push("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ADMIN": return "/admin/dashboard";
      case "LANDLORD": return "/landlord/dashboard";
      case "TENANT": 
      case "SEEKER": return "/tenant/dashboard"; // Seekers can see requests in tenant dash
      default: return "/";
    }
  };

  // Hide global navbar on dashboard, landlord, tenant, admin, and auth portals
  const shouldHideNavbar =
    pathname && (
      pathname.startsWith('/landlord') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/tenant') ||
      pathname.startsWith('/auth')
    );

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>S</div>
          <div>
            <span className={styles.logoText}>SmartRental</span>
            <span className={styles.logoSubtext}>Nền tảng thuê trọ thông minh</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!isAuthChecking && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-deep-blue)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-charcoal)' }}>{user.fullName || user.email.split('@')[0]}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-medium-gray)' }}>
                      {user.role === 'SEEKER' ? 'Người tìm phòng' : 
                       user.role === 'LANDLORD' ? 'Chủ trọ' : 
                       user.role === 'TENANT' ? 'Người thuê' : 
                       user.role === 'ADMIN' ? 'Quản trị viên' : user.role}
                    </span>
                  </div>
                </div>
                <Link href={getDashboardLink()}>
                  <Button variant="primary">Quản lý</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} style={{ padding: '8px', color: 'var(--color-error)' }}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Đăng ký</Button>
                </Link>
              </>
            )
          )}
        </div>

      </div>
    </nav>
  );
}
