import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Credentic Admin",
  description: "Credential management mockup",
}

const geistSans = GeistSans
const geistMono = GeistMono

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}> 
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
