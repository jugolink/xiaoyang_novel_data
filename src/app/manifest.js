export default function manifest() {
  return {
    name: '小说阅读站',
    short_name: '阅读',
    description: '纯净的静态小说阅读体验',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#faf8f5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
