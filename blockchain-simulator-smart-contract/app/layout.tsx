import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blockchain simulator smart contract',
  description: 'Blockchain simulator smart contract'
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
