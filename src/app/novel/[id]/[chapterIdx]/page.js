import { loadChaptersMeta, getChapterContent, loadAllNovels } from "@/lib/novels";
import ReaderClient from "@/components/ReaderClient";

export async function generateStaticParams() {
  const novels = await loadAllNovels();
  const params = [];
  
  for (const novel of novels) {
    const meta = await loadChaptersMeta(novel.id);
    if (meta) {
      meta.chapters.forEach((ch, idx) => {
        params.push({
          id: novel.id,
          chapterIdx: idx.toString()
        });
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { id, chapterIdx } = await params;
  const ch = await getChapterContent(id, parseInt(chapterIdx));
  if (!ch) return { title: "未找到章节" };
  return {
    title: `${ch.title} - ${ch.novel.title}`,
  };
}

export default async function ChapterPage({ params }) {
  const { id, chapterIdx } = await params;
  const idx = parseInt(chapterIdx);
  
  const ch = await getChapterContent(id, idx);
  const meta = await loadChaptersMeta(id);

  if (!ch || !meta) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>未找到章节内容</div>;
  }

  return (
    <ReaderClient 
      chapter={ch} 
      chapters={meta.chapters} 
      novel={meta.novel} 
    />
  );
}
