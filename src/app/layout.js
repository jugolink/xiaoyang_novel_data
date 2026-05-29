import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import PWARegistrar from '@/components/PWARegistrar';

export const metadata = {
  title: '小羊的小说书架',
  description: '云端阅读 · 随更随看。致力于提供纯粹、优雅、沉浸式的阅读体验。',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PWARegistrar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
