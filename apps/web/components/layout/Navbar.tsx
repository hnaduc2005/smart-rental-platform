'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/common';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Tìm phòng', href: '/rooms' },
];

export function Navbar() {
  const pathname = usePathname();

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
          <Button variant="secondary">Đăng nhập</Button>
          <Button variant="primary">Đăng ký</Button>
        </div>

      </div>
    </nav>
  );
}
