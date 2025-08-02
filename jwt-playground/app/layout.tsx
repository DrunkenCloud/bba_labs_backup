import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JWT Playground',
  description: 'A playground for experimenting with JWTs'
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
