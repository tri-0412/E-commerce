import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "My Ecommerce",
  description: "An ecommerce application built with Next.js and Stripe",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="flex min-h-full flex-col bg-white"
        cz-shortcut-listen="true" // Thêm trực tiếp trên server
      >
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
          <Toaster position="top-right" />
        </main>
        <Footer />
      </body>
    </html>
  );
}
