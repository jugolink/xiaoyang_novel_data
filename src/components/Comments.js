"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

export default function Comments() {
  const containerRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    // 每次主题切换或重新挂载时清空重新生成
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";

    // ==========================================
    // ⚠️ 请在这里替换为您真实的 Giscus 配置信息
    // 去 https://giscus.app/zh-CN 获取
    // ==========================================
    script.setAttribute("data-repo", "jugolink/xiaoyang_giscus");
    script.setAttribute("data-repo-id", "R_kgDOSq-m7w");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOSq-m784C-D4N");

    script.setAttribute("data-mapping", "pathname"); // 根据页面 URL 区分评论区
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");

    // 匹配小说站当前主题
    let giscusTheme = "light";
    if (theme === "dark") giscusTheme = "dark";
    if (theme === "green") giscusTheme = "light_tritanopia"; // 尽量找个护眼的

    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "zh-CN");
    script.crossOrigin = "anonymous";
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, [theme]);

  return (
    <div style={{ marginTop: "4rem", borderTop: "1px solid var(--border-light)", paddingTop: "2rem" }}>
      <div ref={containerRef} className="giscus" />
    </div>
  );
}
