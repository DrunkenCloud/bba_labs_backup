import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blockchain Interaction Simulator',
  description: 'Blockchain Interaction Simulator',
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
