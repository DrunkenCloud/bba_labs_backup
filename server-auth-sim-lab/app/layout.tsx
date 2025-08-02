import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SERVER AUTH SIM LAB',
  description: 'A lab for simulating server authentication'
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
