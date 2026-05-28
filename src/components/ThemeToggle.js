"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Leaf } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { id: "light", icon: <Sun size={18} />, label: "羊皮纸" },
    { id: "dark", icon: <Moon size={18} />, label: "暗夜" },
    { id: "green", icon: <Leaf size={18} />, label: "护眼绿" },
  ];

  return (
    <div className={styles.toggleGroup}>
      {themes.map((t) => (
        <button
          key={t.id}
          className={`${styles.toggleBtn} ${theme === t.id ? styles.active : ""}`}
          onClick={() => changeTheme(t.id)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
