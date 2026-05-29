"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, BookOpen } from "lucide-react";
import styles from "./SearchModal.module.css";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState([]);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      if (index.length === 0) {
        fetch("/search.json")
          .then((res) => res.json())
          .then((data) => setIndex(data))
          .catch((err) => console.error("Failed to load search index", err));
      }
    }
  }, [isOpen, index.length]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const lowerQ = query.toLowerCase();
    const filtered = index.filter(
      (item) => 
        item.title.toLowerCase().includes(lowerQ) || 
        item.desc.toLowerCase().includes(lowerQ) ||
        item.author.toLowerCase().includes(lowerQ)
    );
    setResults(filtered);
  }, [query, index]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-fade-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Search size={20} className={styles.icon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索小说名、作者或简介..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.results}>
          {query.trim() && results.length === 0 ? (
            <div className={styles.noResults}>未找到相关小说</div>
          ) : (
            results.map((item) => (
              <Link 
                key={item.id} 
                href={item.url} 
                className={styles.resultItem}
                onClick={onClose}
              >
                <div className={styles.resultIcon}>
                  <BookOpen size={18} />
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultTitle}>{item.title}</div>
                  <div className={styles.resultDesc}>{item.desc}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
