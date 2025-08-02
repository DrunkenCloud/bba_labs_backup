import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MFA Auth',
  description: 'Multi-Factor Authentication Application'
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
