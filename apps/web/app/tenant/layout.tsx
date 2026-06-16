import Sidebar from "./Sidebar";
import styles from "./layout.module.css";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
