// File: src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import TopNav from './components/TopNav'; // ← client nav

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'University Marketplace',
  description: 'A platform for university students to buy and sell items',
  manifest: '/manifest.json',   // ✅ PWA support
  themeColor: '#2980B9',        // ✅ install bar color
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 flex flex-col min-h-screen`}>
        {/* Header (client-side auth awareness) */}
        <TopNav />

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} University Marketplace. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
