import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Guyub Gowes — Bapak-Bapak Sepedahan',
  description: 'Platform komunitas pesepeda bapak-bapak: direktori rute GPX, gowes bareng (Open Ride), dan forum diskusi jalanan.',
  keywords: ['sepeda', 'gowes', 'bapak-bapak sepedahan', 'guyub gowes', 'open ride', 'rute gpx'],
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <body className="bg-[#141415] text-[#F5F5F5] antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
