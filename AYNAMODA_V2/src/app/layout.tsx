import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'AYNAMODA - Akıllı Dijital Gardırop',
  description: 'Kişisel stil danışmanınız cebinizde. Gardırobunuzu akıllıca organize edin, yeni kombinler keşfedin.',
  keywords: ['gardırop', 'moda', 'stil', 'AI', 'dijital gardırop', 'kombin'],
  authors: [{ name: 'AYNAMODA Team' }],
  creator: 'AYNAMODA',
  publisher: 'AYNAMODA',
  metadataBase: new URL('https://aynamoda.com'),
  openGraph: {
    title: 'AYNAMODA - Akıllı Dijital Gardırop',
    description: 'Kişisel stil danışmanınız cebinizde',
    url: 'https://aynamoda.com',
    siteName: 'AYNAMODA',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AYNAMODA',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYNAMODA - Akıllı Dijital Gardırop',
    description: 'Kişisel stil danışmanınız cebinizde',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  themeColor: '#ed56ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
          {children}
        </div>
      </body>
    </html>
  )
} 