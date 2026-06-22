import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartRental — Nền tảng thuê trọ thông minh",
  description: "Tìm phòng trọ, căn hộ, ký túc xá nhanh chóng và dễ dàng trên SmartRental.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
