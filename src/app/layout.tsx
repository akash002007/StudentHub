import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('studenthub_theme');
                  var isDark = stored === 'dark' || ((!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-purple-500/20 selection:text-purple-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


