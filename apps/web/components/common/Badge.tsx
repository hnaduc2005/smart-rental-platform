import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'success' | 'error' | 'info' | 'warning' | 'tag';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Badge({ variant = 'success', children, icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {icon && icon}
      {children}
    </span>
  );
}
