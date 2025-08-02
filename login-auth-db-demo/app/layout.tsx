import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Login Auth DB Demo',
  description: 'A demonstration of login authentication with a database'
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
