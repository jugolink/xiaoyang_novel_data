import Link from "next/link";
import { loadAllNovels } from "@/lib/novels";
import Navbar from "@/components/Navbar";
import styles from "./page.module.css";

export default async function Home() {
  const novels = await loadAllNovels();

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.header}>
        <h1 className={`${styles.title} font-serif`}>📚 咩咩书屋</h1>
        <p className={styles.subtitle}>云端阅读 · 随更随看</p>
      </div>

      <div className={styles.grid}>
        {novels.map((n) => (
          <Link href={`/novel/${n.id}`} key={n.id} className={`${styles.card} animate-fade-in`}>
            <div
              className={styles.cover}
              style={{ background: n.coverGradient }}
            >
              <span className={styles.emoji}>{n.coverEmoji}</span>
              <span className={`${styles.status} ${styles[n.status]}`}>
                {n.status === "completed" ? "已完结" : "连载中"}
              </span>
            </div>
            <div className={styles.cardBody}>
              <h2 className={`${styles.cardTitle} font-serif`}>{n.title}</h2>
              <p className={styles.author}>{n.author} 作品</p>
              <p className={styles.desc}>{n.desc}</p>
              <p className={styles.meta}>
                {n.shortStoryMode ? (
                  `共 ${n.totalCount} 篇`
                ) : (
                  <>共 {n.chapterCount} 章正文
                  {n.extraCount > 0 ? ` + ${n.extraCount} 篇番外` : ""}</>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <footer className={styles.footer}>
        <p>共 {novels.length} 部作品</p>
      </footer>
    </main>
  );
}
