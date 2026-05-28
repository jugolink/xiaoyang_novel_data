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
  {
    id: 'kan-jian',
    dir: '看见',
    title: '看见',
    author: '莫言',
    status: 'serializing',
    desc: '短篇连作集 · 十二个普通人被看见的瞬间',
    coverGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    coverEmoji: '👁️',
    // 短篇集模式：文件名即篇名，无章序号
    shortStoryMode: true,
  },
  {
    id: 'han-hun',
    dir: '喊魂',
    title: '喊魂',
    author: '莫言',
    status: 'serializing',
    desc: '民俗悬疑 · 八篇单元剧，749局 × 中微子 × 民间怪谈',
    coverGradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)',
    coverEmoji: '🔮',
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
  // 支持中文数字：第一章、第十二章
  const m = filename.match(/^第([一二三四五六七八九十百]+)章/);
  if (m) return cntitleToNum(m[1]);
  // 支持阿拉伯数字：第1章、第86章
  const m2 = filename.match(/^第(\d+)章/);
  if (m2) return parseInt(m2[1], 10);
  // 番外排在最后
  if (filename.startsWith('番外')) return 999;
  // 短篇按字母序
  return 1000;
}

const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十',
  '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', '四十',
  '四十一', '四十二', '四十三', '四十四', '四十五', '四十六', '四十七', '四十八', '四十九', '五十',
  '五十一', '五十二', '五十三', '五十四', '五十五', '五十六', '五十七', '五十八', '五十九', '六十',
  '六十一', '六十二', '六十三', '六十四', '六十五', '六十六', '六十七', '六十八', '六十九', '七十',
  '七十一', '七十二', '七十三', '七十四', '七十五', '七十六', '七十七', '七十八', '七十九', '八十',
  '八十一', '八十二', '八十三', '八十四', '八十五', '八十六', '八十七', '八十八', '八十九', '九十',
  '九十一', '九十二', '九十三', '九十四', '九十五', '九十六', '九十七', '九十八', '九十九', '一百'];

// 获取小说的基础目录 (在项目的根目录下)
const getNovelsDir = () => path.join(process.cwd(), 'novels_data');

// 过滤非正文文件（排除 outline、concept 等管理文件）
function isContentFile(filename) {
  const lower = filename.toLowerCase();
  if (lower === 'outline.md' || lower === 'concept.md') return false;
  if (lower.includes('outline') || lower.includes('concept')) return false;
  // 排除 story-arcs, synopsis, characters 等管理文件
  if (/^(story-arcs|synopsis|characters|publish-log)/i.test(lower)) return false;
  return filename.endsWith('.md');
}

export async function loadChaptersMeta(novelId) {
  const novel = NOVELS.find(n => n.id === novelId);
  if (!novel) return null;

  const dir = path.join(getNovelsDir(), novel.dir);
  if (!fs.existsSync(dir)) return { novel, chapters: [] };

  const allFiles = fs.readdirSync(dir).filter(isContentFile);

  if (novel.shortStoryMode) {
    // 短篇集模式：按文件名字典排序，label = 文件名（去 .md）
    const files = allFiles
      .filter(f => !f.startsWith('第'))  // 安全：排除意外带章节号的文件
      .sort((a, b) => a.localeCompare(b, 'zh'));

    const chapters = files.map((f, i) => {
      const rawName = f.replace('.md', '');
      return {
        file: f,
        title: rawName,
        label: rawName,
        isExtra: false,
        index: i,
      };
    });
    return { novel, chapters };
  }

  // 传统模式：按章节号排序
  const files = allFiles.sort((a, b) => {
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
    if (!fs.existsSync(dir)) return { ...n, chapterCount: n.shortStoryMode ? 0 : 0, extraCount: 0, totalCount: 0 };

    const files = fs.readdirSync(dir).filter(isContentFile);

    if (n.shortStoryMode) {
      // 短篇集：统计篇数
      const totalCount = files.length;
      return { ...n, chapterCount: 0, extraCount: 0, totalCount };
    }

    const mainChapters = files.filter(f => /^第.+章/.test(f)).length;
    const extras = files.filter(f => f.startsWith('番外')).length;
    return { ...n, chapterCount: mainChapters, extraCount: extras, totalCount: mainChapters + extras };
  });
}
