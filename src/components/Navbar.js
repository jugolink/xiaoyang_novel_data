"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";
import styles from "./Navbar.module.css";
import { BookOpen, ArrowLeft, Search } from "lucide-react";

export default function Navbar({ title, backUrl, backLabel }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
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
          <button 
            className={styles.searchBtn} 
            onClick={() => setSearchOpen(true)}
            aria-label="搜索"
            title="搜索"
          >
            <Search size={20} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
