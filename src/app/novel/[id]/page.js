import Link from "next/link";
import { loadChaptersMeta, loadAllNovels } from "@/lib/novels";
import Navbar from "@/components/Navbar";
import ContinueReadingBtn from "@/components/ContinueReadingBtn";
import styles from "./page.module.css";
import { BookOpen, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const novels = await loadAllNovels();
  return novels.map((novel) => ({
    id: novel.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const meta = await loadChaptersMeta(id);
  if (!meta) return { title: "未找到小说" };
  return {
    title: `${meta.novel.title} - 小羊的小说书架`,
    description: meta.novel.desc,
  };
}

export default async function NovelPage({ params }) {
  const { id } = await params;
  const meta = await loadChaptersMeta(id);

  if (!meta) {
    return (
      <main className={styles.main}>
        <Navbar />
        <div className={styles.notFound}>小说未找到</div>
      </main>
    );
  }

  const { novel, chapters } = meta;

  return (
    <main className={styles.main}>
      <Navbar
        title={novel.title}
        backUrl="/"
        backLabel="书架"
      />

      <div className={styles.hero}>
        <div className={styles.cover} style={{ background: novel.coverGradient }}>
          <span className={styles.emoji}>{novel.coverEmoji}</span>
        </div>
        <div className={styles.info}>
          <h1 className={`${styles.title} font-serif`}>{novel.title}</h1>
          <p className={styles.author}>{novel.author} 著</p>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles[novel.status]}`}>
              {novel.status === "completed" ? "已完结" : "连载中"}
            </span>
            <span className={styles.tag}>{chapters.length} {novel.shortStoryMode ? '篇' : '章'}</span>
          </div>
          <p className={styles.desc}>{novel.desc}</p>
          
          <ContinueReadingBtn novelId={novel.id} chapters={chapters} />
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>目录 ({chapters.length})</h2>
        <div className={styles.chapterGrid}>
          {chapters.map((ch, idx) => (
            <Link
              key={idx}
              href={`/novel/${novel.id}/${idx}`}
              className={`${styles.chapterItem} ${ch.isExtra ? styles.extra : ""}`}
            >
              <span className={styles.chapterLabel}>{ch.label}</span>
              <span className={styles.chapterTitle}>{ch.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
