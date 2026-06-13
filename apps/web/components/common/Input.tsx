import React, { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ className = '', icon, ...props }: InputProps) {
  const inputClasses = [
    styles.input,
    icon ? styles.hasIcon : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <input className={inputClasses} {...props} />
      {icon && (
        <div className={styles.iconWrapper}>
          {icon}
        </div>
      )}
    </div>
  );
}
