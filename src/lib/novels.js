import fs from 'fs';
import path from 'path';

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

// ── 路径工具 ──────────────────────────────────
const getNovelsDir = () => path.join(process.cwd(), 'novels_data');

// 过滤非正文文件（排除 outline、concept、novel.json 等管理文件）
function isContentFile(filename) {
  const lower = filename.toLowerCase();
  if (lower === 'outline.md' || lower === 'concept.md' || lower === 'novel.json') return false;
  if (lower.includes('outline') || lower.includes('concept')) return false;
  if (/^(story-arcs|synopsis|characters|publish-log)/i.test(lower)) return false;
  return filename.endsWith('.md');
}

// ── 核心：文件系统驱动的小说发现 ──────────────

/**
 * 读取单个小说的 novel.json 配置
 * 如果不存在或损坏，返回 null（容错跳过）
 */
function readNovelConfig(dirPath) {
  const configPath = path.join(dirPath, 'novel.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 扫描 novels_data/ 目录，自动发现所有小说。
 * 每个子目录需包含 novel.json，否则跳过。
 * id 自动使用目录名。
 *
 * @returns {Promise<Array>} 小说列表，含章节统计
 */
export async function loadAllNovels() {
  const novelsDir = getNovelsDir();
  if (!fs.existsSync(novelsDir)) return [];

  const entries = fs.readdirSync(novelsDir, { withFileTypes: true });
  const novels = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirPath = path.join(novelsDir, entry.name);
    const config = readNovelConfig(dirPath);
    if (!config) continue; // 容错：没有 novel.json 的目录跳过

    const dirName = entry.name;
    const files = fs.readdirSync(dirPath).filter(isContentFile);

    let chapterCount = 0, extraCount = 0;

    if (config.shortStoryMode) {
      // 短篇集：totalCount = 篇数
      chapterCount = 0;
      extraCount = 0;
    } else {
      chapterCount = files.filter(f => /^第.+章/.test(f)).length;
      extraCount = files.filter(f => f.startsWith('番外')).length;
    }

    novels.push({
      id: config.slug || dirName,
      dir: dirName,
      ...config,
      chapterCount,
      extraCount,
      totalCount: config.shortStoryMode ? files.length : chapterCount + extraCount,
    });
  }

  return novels;
}

/**
 * 根据小说 id（= 目录名）加载章节元数据
 */
export async function loadChaptersMeta(novelId) {
  const novelsDir = getNovelsDir();

  // 如果 novelId 不是直接的目录名，就扫描所有目录找到 slug 匹配的
  const allDirs = fs.readdirSync(novelsDir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  let actualDir = novelId;
  for (const d of allDirs) {
    const cfg = readNovelConfig(path.join(novelsDir, d.name));
    if (cfg && cfg.slug === novelId) {
      actualDir = d.name;
      break;
    }
  }
  const dirPath = path.join(novelsDir, actualDir);

  if (!fs.existsSync(dirPath)) return null;

  const config = readNovelConfig(dirPath);
  if (!config) return null;

  const novel = {
    id: novelId,
    dir: actualDir,
    ...config,
  };

  const allFiles = fs.readdirSync(dirPath).filter(isContentFile);

  if (novel.shortStoryMode) {
    // 短篇集模式：按文件名字典排序，label = 文件名（去 .md）
    const files = allFiles
      .filter(f => !f.startsWith('第'))
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

/**
 * 获取指定章节的完整内容
 */
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
