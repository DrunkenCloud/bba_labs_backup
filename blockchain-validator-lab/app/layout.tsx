import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blockchain Validator Lab',
  description: 'Blockchain Validator Laboratory',
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
