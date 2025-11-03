import './globals.css'

export const metadata = {
  title: 'Collaborative Playlist Manager',
  description: 'Realtime collaborative playlist manager',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

