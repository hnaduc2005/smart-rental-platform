"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/lib/auth";
import styles from "./page.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingRequests: number;
  upcomingAppointments: number;
  monthlyRevenue: number;
  totalTenants: number;
}

interface RentalRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  seeker?: { fullName?: string; email?: string };
  room?: { title?: string; code?: string };
}

interface ViewingAppointment {
  id: string;
  appointmentDate: string;
  status: string;
  seeker?: { fullName?: string; email?: string };
  room?: { title?: string; code?: string };
}

interface Property {
  id: string;
  name: string;
  rooms?: { status: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#0045A8", "#00B7FF", "#FF5C00", "#00C95C", "#8b5cf6", "#ec4899"];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name?: string, email?: string) {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: d.toLocaleString("vi-VN", { month: "short" }),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getToday() {
  const d = new Date();
  return {
    day: d.getDate(),
    month: d.toLocaleString("vi-VN", { month: "long" }),
    year: d.getFullYear(),
    weekday: d.toLocaleString("vi-VN", { weekday: "long" }),
  };
}

// ─── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart({ occupied, available, maintenance }: { occupied: number; available: number; maintenance: number }) {
  const total = occupied + available + maintenance || 1;
  const r = 54;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: occupied, color: "#0045A8", label: "Đang thuê" },
    { value: available, color: "#00C95C", label: "Trống" },
    { value: maintenance, color: "#FF5C00", label: "Bảo trì" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / total) * circ;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className={styles.donutWrapper}>
      <div className={styles.donutContainer}>
        <svg className={styles.donutSvg} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f4fb" strokeWidth="14" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="60" cy="60" r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth="14"
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterValue}>{total}</span>
          <span className={styles.donutCenterLabel}>phòng</span>
        </div>
      </div>
      <div className={styles.donutLegend}>
        {segments.map((seg) => (
          <div key={seg.label} className={styles.donutLegendItem}>
            <div className={styles.donutLegendLeft}>
              <div className={styles.donutLegendDot} style={{ background: seg.color }} />
              <span className={styles.donutLegendLabel}>{seg.label}</span>
            </div>
            <span className={styles.donutLegendValue}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly fake revenue bars ────────────────────────────────────────────────
const MONTHS = ["T2", "T3", "T4", "T5", "T6", "T7"];
const REVENUE_DATA = [62, 75, 58, 88, 70, 95]; // % heights (mock)

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandlordDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [appointments, setAppointments] = useState<ViewingAppointment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const today = getToday();

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) return;

    Promise.allSettled([
      apiRequest<any[]>("/properties/my", { token }),
      apiRequest<any[]>("/rental-requests/my", { token }),
      apiRequest<any[]>("/viewing-appointments/my", { token }),
    ]).then(([propsRes, reqsRes, aptsRes]) => {
      const props: Property[] = propsRes.status === "fulfilled" ? propsRes.value : [];
      const reqs: RentalRequest[] = reqsRes.status === "fulfilled" ? reqsRes.value : [];
      const apts: ViewingAppointment[] = aptsRes.status === "fulfilled" ? aptsRes.value : [];

      setProperties(props);

      // Tính toán stats từ dữ liệu thực
      let totalRooms = 0, occupiedRooms = 0, availableRooms = 0, maintenanceRooms = 0;
      props.forEach((p) => {
        (p.rooms || []).forEach((r) => {
          totalRooms++;
          if (r.status === "OCCUPIED") occupiedRooms++;
          else if (r.status === "AVAILABLE") availableRooms++;
          else maintenanceRooms++;
        });
      });

      const now = Date.now();
      const upcomingApts = apts.filter(
        (a) => a.status === "CONFIRMED" && new Date(a.appointmentDate).getTime() > now
      );

      setStats({
        totalProperties: props.length,
        totalRooms,
        occupiedRooms,
        availableRooms,
        pendingRequests: reqs.filter((r) => r.status === "PENDING").length,
        upcomingAppointments: upcomingApts.length,
        monthlyRevenue: occupiedRooms * 3500000, // Ước tính
        totalTenants: occupiedRooms,
      });

      // 5 yêu cầu mới nhất
      setRequests(
        [...reqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      );

      // 5 lịch hẹn sắp tới
      setAppointments(upcomingApts.slice(0, 5));

      setLoading(false);
    });
  }, []);

  // ── Occupancy data per property ──────────────────────────────────────────
  const occupancyRows = properties.slice(0, 5).map((p) => {
    const total = (p.rooms || []).length || 1;
    const occ = (p.rooms || []).filter((r) => r.status === "OCCUPIED").length;
    return { label: p.name, pct: Math.round((occ / total) * 100), occ, total };
  });

  // Maintenance count
  const maintenanceRooms = properties.reduce((acc, p) => {
    return acc + (p.rooms || []).filter((r) => r.status !== "OCCUPIED" && r.status !== "AVAILABLE").length;
  }, 0);

  // ─────────────────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    {
      label: "Khu / Nhà trọ",
      value: stats?.totalProperties ?? "–",
      icon: "🏢",
      iconBg: "rgba(0,69,168,0.08)",
      color: "#0045A8",
      change: null,
    },
    {
      label: "Tổng số phòng",
      value: stats?.totalRooms ?? "–",
      icon: "🔑",
      iconBg: "rgba(0,183,255,0.1)",
      color: "#00B7FF",
      change: { label: `${stats?.occupiedRooms ?? 0} đang thuê`, type: "neutral" as const },
    },
    {
      label: "Yêu cầu chờ duyệt",
      value: stats?.pendingRequests ?? "–",
      icon: "📩",
      iconBg: "rgba(255,92,0,0.09)",
      color: "#FF5C00",
      change: { label: "Cần xử lý ngay", type: (stats?.pendingRequests ?? 0) > 0 ? ("up" as const) : ("neutral" as const) },
    },
    {
      label: "Lịch xem phòng",
      value: stats?.upcomingAppointments ?? "–",
      icon: "📅",
      iconBg: "rgba(0,201,92,0.09)",
      color: "#00C95C",
      change: { label: "Sắp tới", type: "neutral" as const },
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h2>Chào mừng trở lại! 👋</h2>
          <p>Đây là tổng quan hoạt động khu trọ của bạn hôm nay.</p>
        </div>
        <div className={styles.welcomeDate}>
          <div className={styles.dateDay}>{today.day}</div>
          <div className={styles.dateMonth}>{today.month} {today.year} • {today.weekday}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className={styles.statCard}
            style={{ ["--stat-color" as string]: card.color, ["--stat-bg" as string]: card.iconBg }}
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{card.label}</span>
              <div className={styles.statIcon}>{card.icon}</div>
            </div>
            {loading ? (
              <div className={styles.skeleton} style={{ height: 36, width: "60%" }} />
            ) : (
              <div className={styles.statValue}>{card.value}</div>
            )}
            {card.change && (
              <div className={`${styles.statChange} ${styles[card.change.type]}`}>
                {card.change.type === "up" && "🔴 "}
                {card.change.type === "neutral" && "📊 "}
                {card.change.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left: Recent rental requests */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📩 Yêu cầu thuê gần đây</h3>
            <Link href="/landlord/rental-requests" className={styles.cardAction}>
              Xem tất cả →
            </Link>
          </div>
          <div className={styles.requestsList}>
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={{ padding: "16px 24px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div className={styles.skeleton} style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className={styles.skeleton} style={{ height: 13, width: "60%" }} />
                    <div className={styles.skeleton} style={{ height: 11, width: "40%" }} />
                  </div>
                </div>
              ))
            ) : requests.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <span className={styles.emptyText}>Chưa có yêu cầu thuê nào</span>
              </div>
            ) : (
              requests.map((req) => {
                const name = req.seeker?.fullName || req.seeker?.email || "Khách";
                const roomTitle = req.room?.title || req.room?.code || "Phòng";
                const color = avatarColor(name);
                const statusMap = {
                  PENDING: { label: "Chờ duyệt", cls: styles.statusPending },
                  APPROVED: { label: "Đã duyệt", cls: styles.statusApproved },
                  REJECTED: { label: "Từ chối", cls: styles.statusRejected },
                };
                const statusInfo = statusMap[req.status] ?? statusMap.PENDING;
                return (
                  <Link key={req.id} href="/landlord/rental-requests" className={styles.requestItem} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className={styles.requestAvatar} style={{ background: color }}>
                      {initials(req.seeker?.fullName, req.seeker?.email)}
                    </div>
                    <div className={styles.requestInfo}>
                      <div className={styles.requestName}>{name}</div>
                      <div className={styles.requestRoom}>🔑 {roomTitle}</div>
                    </div>
                    <div className={styles.requestMeta}>
                      <div className={styles.requestTime}>{timeAgo(req.createdAt)}</div>
                      <span className={`${styles.statusBadge} ${statusInfo.cls}`}>{statusInfo.label}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightColumn}>
          {/* Room status donut */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🔑 Trạng thái phòng</h3>
            </div>
            {loading ? (
              <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
                <div className={styles.skeleton} style={{ width: 150, height: 150, borderRadius: "50%" }} />
              </div>
            ) : (
              <DonutChart
                occupied={stats?.occupiedRooms ?? 0}
                available={stats?.availableRooms ?? 0}
                maintenance={maintenanceRooms}
              />
            )}
          </div>

          {/* Upcoming appointments */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>📅 Lịch xem phòng sắp tới</h3>
              <Link href="/landlord/viewing-appointments" className={styles.cardAction}>Xem thêm →</Link>
            </div>
            <div className={styles.appointmentList}>
              {loading ? (
                [1, 2].map((i) => (
                  <div key={i} style={{ padding: "14px 24px", display: "flex", gap: 14, alignItems: "center" }}>
                    <div className={styles.skeleton} style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className={styles.skeleton} style={{ height: 13, width: "55%" }} />
                      <div className={styles.skeleton} style={{ height: 11, width: "40%" }} />
                    </div>
                  </div>
                ))
              ) : appointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📆</span>
                  <span className={styles.emptyText}>Không có lịch hẹn nào sắp tới</span>
                </div>
              ) : (
                appointments.map((apt) => {
                  const { day, month, time } = fmtDate(apt.appointmentDate);
                  const name = apt.seeker?.fullName || apt.seeker?.email || "Khách";
                  const roomTitle = apt.room?.title || apt.room?.code || "Phòng";
                  return (
                    <div key={apt.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentDate}>
                        <span className={styles.appointmentDateDay}>{day}</span>
                        <span className={styles.appointmentDateMonth}>{month}</span>
                      </div>
                      <div className={styles.appointmentInfo}>
                        <div className={styles.appointmentName}>{name}</div>
                        <div className={styles.appointmentRoom}>🔑 {roomTitle}</div>
                      </div>
                      <span className={styles.appointmentTime}>{time}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className={styles.bottomGrid}>
        {/* Occupancy by property */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🏢 Tỷ lệ lấp đầy theo khu</h3>
            <Link href="/landlord/properties" className={styles.cardAction}>Chi tiết →</Link>
          </div>
          <div className={styles.occupancyChart}>
            <div className={styles.occupancyLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: "#0045A8" }} />
                <span>Đang thuê</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: "#e6ecf6" }} />
                <span>Còn trống</span>
              </div>
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeleton} style={{ height: 10, borderRadius: 100 }} />
                ))}
              </div>
            ) : occupancyRows.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🏢</span>
                <span className={styles.emptyText}>Chưa có khu trọ nào</span>
              </div>
            ) : (
              <div className={styles.barChart}>
                {occupancyRows.map((row) => (
                  <div key={row.label} className={styles.barRow}>
                    <span className={styles.barLabel} title={row.label}>
                      {row.label.length > 12 ? row.label.slice(0, 12) + "…" : row.label}
                    </span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${row.pct}%`,
                          background: "linear-gradient(90deg, #0045A8, #00B7FF)",
                        }}
                      />
                    </div>
                    <span className={styles.barValue}>{row.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>⚡ Thao tác nhanh</h3>
          </div>
          <div className={styles.quickActionsGrid}>
            {[
              { href: "/landlord/rooms", icon: "🔑", label: "Thêm phòng trọ" },
              { href: "/landlord/invoices", icon: "🧾", label: "Tạo hóa đơn" },
              { href: "/landlord/contracts", icon: "📄", label: "Xem hợp đồng" },
              { href: "/landlord/tenants", icon: "👥", label: "Danh sách khách" },
              { href: "/landlord/reports", icon: "⚠️", label: "Báo cáo sự cố" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className={styles.quickActionBtn}>
                <span className={styles.quickActionIcon}>{action.icon}</span>
                <span className={styles.quickActionLabel}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
