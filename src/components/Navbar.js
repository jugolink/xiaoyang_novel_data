import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import styles from "./Navbar.module.css";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function Navbar({ title, backUrl, backLabel }) {
  return (
    <header className={`${styles.navbar} glass`}>
      <div className={styles.container}>
        <div className={styles.left}>
          {backUrl ? (
            <Link href={backUrl} className={styles.backLink}>
              <ArrowLeft size={18} />
              {backLabel || "返回"}
            </Link>
          ) : (
            <Link href="/" className={styles.brand}>
              <BookOpen className={styles.logo} size={24} />
              <span className={styles.title}>{title || "小羊的小说书架"}</span>
            </Link>
          )}
          {backUrl && title && <span className={styles.titleWithBack}>{title}</span>}
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
