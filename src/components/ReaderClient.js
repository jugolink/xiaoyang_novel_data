"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ThemeToggle from "./ThemeToggle";
import styles from "./ReaderClient.module.css";
import { useRouter } from "next/navigation";

export default function ReaderClient({ chapter, chapters, novel }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(1.1);
  const [uiVisible, setUiVisible] = useState(true);
  const router = useRouter();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && chapter.idx > 0) {
        router.push(`/novel/${novel.id}/${chapter.idx - 1}`);
      }
      if (e.key === "ArrowRight" && chapter.idx < chapters.length - 1) {
        router.push(`/novel/${novel.id}/${chapter.idx + 1}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter.idx, chapters.length, novel.id, router]);

  // Save reading progress
  useEffect(() => {
    localStorage.setItem(`novel-progress-${novel.id}`, chapter.idx.toString());
  }, [novel.id, chapter.idx]);

  // Read preferences
  useEffect(() => {
    const savedSize = localStorage.getItem("novel-fontsize");
    if (savedSize) setFontSize(parseFloat(savedSize));
  }, []);

  const changeFontSize = (delta) => {
    const newSize = Math.max(0.8, Math.min(2.0, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem("novel-fontsize", newSize.toString());
  };

  const toggleUi = () => {
    setUiVisible(!uiVisible);
    if (settingsOpen) setSettingsOpen(false);
  };

  const hasPrev = chapter.idx > 0;
  const hasNext = chapter.idx < chapters.length - 1;

  // Swiping detection
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && hasNext) router.push(`/novel/${novel.id}/${chapter.idx + 1}`);
    if (isRightSwipe && hasPrev) router.push(`/novel/${novel.id}/${chapter.idx - 1}`);
  };

  return (
    <div 
      className={styles.readerWrapper}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Topbar */}
      <header className={`${styles.topbar} glass ${uiVisible ? "" : styles.hideTopbar}`}>
        <div className={styles.topbarLeft}>
          <Link href={`/novel/${novel.id}`} className={styles.backLink} title="返回详情">
            <ArrowLeft size={20} />
          </Link>
          <button 
            className={styles.iconBtn} 
            onClick={() => setSidebarOpen(true)}
            aria-label="目录"
          >
            <Menu size={20} />
          </button>
          <span className={styles.novelTitle}>
            {novel.title}
          </span>
        </div>
        <div className={styles.topbarRight}>
          <button 
            className={styles.iconBtn} 
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {settingsOpen && (
        <div className={`${styles.settingsPanel} glass animate-fade-in`}>
          <div className={styles.settingsRow}>
            <span>主题</span>
            <ThemeToggle />
          </div>
          <div className={styles.settingsRow}>
            <span>字号</span>
            <div className={styles.fontControls}>
              <button onClick={() => changeFontSize(-0.1)}>A-</button>
              <span className={styles.fontSizeVal}>{Math.round(fontSize * 100)}%</span>
              <button onClick={() => changeFontSize(0.1)}>A+</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className={`${styles.overlay} animate-fade-in`} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>目录 ({chapters.length})</span>
          <button className={styles.iconBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <ul className={styles.chapterList}>
          {chapters.map((ch, i) => (
            <li key={i}>
              <Link 
                href={`/novel/${novel.id}/${i}`}
                className={`${styles.chapterItem} ${i === chapter.idx ? styles.active : ""} ${ch.isExtra ? styles.extra : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.chLabel}>{ch.label}</span>
                <span className={styles.chTitle}>{ch.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main 
        className={`${styles.mainContent} animate-fade-in`}
        style={{ fontSize: `${fontSize}rem` }}
      >
        <div className={styles.clickZoneCenter} onClick={toggleUi} />
        
        <div className={styles.contentWrapper}>
          <div className={styles.chapterHeader}>
            <span className={styles.chapterNum}>{chapter.label}</span>
            <h1 className={styles.chapterTitle}>{chapter.title}</h1>
            <div className={styles.chapterMeta}>
              <span>{chapter.wordCount} 字</span>
              <span className={styles.metaDot}>·</span>
              <span>预计阅读 {Math.max(1, Math.ceil(chapter.wordCount / 300))} 分钟</span>
            </div>
          </div>

          <article className={`${styles.markdownBody} font-serif`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {chapter.content}
            </ReactMarkdown>
          </article>

          <div className={styles.footerNav}>
            {hasPrev ? (
              <Link href={`/novel/${novel.id}/${chapter.idx - 1}`} className={styles.navBtn}>
                <ArrowLeft size={18} /> 上一章
              </Link>
            ) : (
              <span />
            )}
            
            <span className={styles.pageInfo}>
              {chapter.idx + 1} / {chapters.length}
            </span>

            {hasNext ? (
              <Link href={`/novel/${novel.id}/${chapter.idx + 1}`} className={styles.navBtn}>
                下一章 <ArrowRight size={18} />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
