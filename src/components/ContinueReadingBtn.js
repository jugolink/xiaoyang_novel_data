"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Play } from "lucide-react";
import styles from "./ContinueReadingBtn.module.css";

export default function ContinueReadingBtn({ novelId, chapters }) {
  const [lastReadIdx, setLastReadIdx] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`novel-progress-${novelId}`);
    if (saved) {
      setLastReadIdx(parseInt(saved, 10));
    }
  }, [novelId]);

  if (chapters.length === 0) return null;

  if (lastReadIdx !== null && chapters[lastReadIdx]) {
    return (
      <Link href={`/novel/${novelId}/${lastReadIdx}`} className={styles.continueBtn}>
        <Play size={18} />
        继续阅读：{chapters[lastReadIdx].label}
      </Link>
    );
  }

  return (
    <Link href={`/novel/${novelId}/0`} className={styles.readBtn}>
      <BookOpen size={18} />
      开始阅读
    </Link>
  );
}
