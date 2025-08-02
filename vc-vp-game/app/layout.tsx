import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'vc-vp-game',
  description: 'A game for visualizing and validating blockchain transactions'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
