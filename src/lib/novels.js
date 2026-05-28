import fs from 'fs';
import path from 'path';

// ── 小说配置 ──────────────────────────────────
export const NOVELS = [
  {
    id: 'shou-hu-zhe',
    dir: '谁是守护者',
    title: '踩到一只林知远',
    author: '小羊',
    status: 'completed',
    desc: '校园青春 · 从高一补习班踩到的那只鞋开始',
    coverGradient: 'linear-gradient(135deg, #3a2a18 0%, #5c3d2e 50%, #8b5e3c 100%)',
    coverEmoji: '📖',
  },
];

// ── 中文数字工具 ──────────────────────────────
const CH_NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };

export function cntitleToNum(s) {
  const ti = s.indexOf('十');
  if (ti === -1) return CH_NUM[s] || 0;
  const tens = s.slice(0, ti);
  let n = tens === '' ? 10 : (CH_NUM[tens] || 0) * 10;
  const ones = s.slice(ti + 1);
  if (ones && CH_NUM[ones]) n += CH_NUM[ones];
  return n;
}

export function extractChapterOrder(filename) {
  const m = filename.match(/^第([一二三四五六七八九十]+)章/);
  if (m) return cntitleToNum(m[1]);
  if (filename.startsWith('番外')) return 999;
  return 1000;
}

const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十',
  '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', '四十'];

// 获取小说的基础目录 (在项目的根目录下)
const getNovelsDir = () => path.join(process.cwd(), 'novels_data');

export async function loadChaptersMeta(novelId) {
  const novel = NOVELS.find(n => n.id === novelId);
  if (!novel) return null;
  
  // 假定 Markdown 存放在项目根目录的 novels_data 目录下
  const dir = path.join(getNovelsDir(), novel.dir);
  if (!fs.existsSync(dir)) return { novel, chapters: [] };

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => {
      const oa = extractChapterOrder(a), ob = extractChapterOrder(b);
      if (oa !== ob) return oa - ob;
      return a.localeCompare(b, 'zh');
    });

  let chIdx = 0;
  const chapters = files.map((f, i) => {
    const isExtra = f.startsWith('番外');
    const fullTitle = f.replace('.md', '');
    let label, title;
    if (isExtra) {
      label = '番外';
      title = fullTitle.replace(/^番外_/, '');
    } else {
      chIdx++;
      label = '第' + (CN_DIGITS[chIdx] || chIdx) + '章';
      title = fullTitle.replace(/^第[^章]+章_/, '');
    }
    return { file: f, title, label, isExtra, index: i };
  });

  return { novel, chapters };
}

export async function getChapterContent(novelId, idx) {
  const meta = await loadChaptersMeta(novelId);
  if (!meta || idx >= meta.chapters.length) return null;

  const ch = meta.chapters[idx];
  const filePath = path.join(getNovelsDir(), meta.novel.dir, ch.file);
  
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  // Simple word count: remove markdown syntax roughly and count length.
  const plainText = content.replace(/[#*`_>\[\]\-\n\r\s]/g, '');
  const wordCount = plainText.length;

  return {
    ...ch,
    content, // 返回原始 Markdown 供 react-markdown 处理
    wordCount,
    idx,
    total: meta.chapters.length,
    novel: meta.novel
  };
}

export async function loadAllNovels() {
  return NOVELS.map(n => {
    const dir = path.join(getNovelsDir(), n.dir);
    if (!fs.existsSync(dir)) return { ...n, chapterCount: 0, extraCount: 0 };
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const mainChapters = files.filter(f => /^第.+章/.test(f)).length;
    const extras = files.filter(f => f.startsWith('番外')).length;
    
    return { ...n, chapterCount: mainChapters, extraCount: extras };
  });
}
