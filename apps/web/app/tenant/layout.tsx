"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import styles from "./layout.module.css";
import { getCurrentUser, getStoredAccessToken, clearStoredAccessToken } from "@/lib/auth";

export default function TenantLayout({
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
        if (!data || (data.role !== "TENANT" && data.role !== "SEEKER")) {
          // Both Tenant and Seeker can access Tenant pages for their requests/wishlist
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

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
