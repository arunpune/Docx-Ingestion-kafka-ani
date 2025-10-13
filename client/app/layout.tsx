import { File } from "lucide-react";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Document Ingestion Dashboard",
  description: "Minimal and professional document processing workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex flex-col min-h-screen antialiased">
        {/* Header */}
        <header className="bg-black border-b border-gray-800 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex gap-3">
            <File/>
            <Link 
              href="/" 
              className="text-lg font-semibold text-white tracking-tight hover:text-gray-300 transition-colors"
            >
              Document Ingestion Dashboard
            </Link>
            </div>

            <nav className="flex items-center space-x-1">
              <Link 
                href="/" 
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all duration-200 font-medium"
              >
                Home
              </Link>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-black border-t border-gray-800 py-6">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} Document Ingestion Dashboard
            </span>
            <span className="text-sm text-gray-600">
              Secure • Reliable • Real-time
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
