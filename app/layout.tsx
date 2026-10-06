import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Bazaar - Modern Classifieds & Peer-to-Peer Marketplace',
  description: 'Buy and sell items directly near you. Electronics, phones, bikes, furniture, vehicles and more with instant seller phone calling.',
  keywords: ['marketplace', 'classifieds', 'buy and sell', 'used electronics', 'local deals', 'bazaar'],
  openGraph: {
    title: 'Bazaar - Buy & Sell Things Near You',
    description: 'Find great deals or sell items you no longer need. Contact sellers directly by phone.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
