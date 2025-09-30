import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://wallet.glin.ai'),
  title: 'GLIN Wallet - Web3 Wallet for GLIN Network',
  description: 'Secure, fast, and easy-to-use wallet for managing your GLIN tokens on the GLIN testnet',
  keywords: ['GLIN', 'wallet', 'crypto', 'web3', 'blockchain', 'testnet'],
  authors: [{ name: 'GLIN Team' }],
  creator: 'GLIN Network',
  publisher: 'GLIN Network',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/glin-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/glin-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/glin-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/glin-128.png', sizes: '128x128', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/glin-coin.svg', color: '#8B5CF6' }
    ]
  },

  manifest: '/manifest.json',

  openGraph: {
    title: 'GLIN Wallet',
    description: 'Web3 Wallet for GLIN Network',
    url: 'https://wallet.glin.ai',
    siteName: 'GLIN Wallet',
    images: [
      {
        url: '/glin-512.png',
        width: 512,
        height: 512,
        alt: 'GLIN Coin'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GLIN Wallet',
    description: 'Web3 Wallet for GLIN Network',
    images: ['/glin-512.png'],
    creator: '@glinnetwork'
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8B5CF6' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' }
  ],
};