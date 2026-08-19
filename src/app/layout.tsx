import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudentHub — The Professional Network Built For Ambitious Students",
  description:
    "Discover high-impact internships, showcase verified technical projects, connect with peer student communities, and track your applications in one unified workspace.",
  keywords: [
    "student internships",
    "software engineering intern",
    "student professional network",
    "college career platform",
    "coding communities",
    "application tracker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-purple-500/20 selection:text-purple-300">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <DataProvider>{children}</DataProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
