import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/feature/ThemeProvider";

export const metadata: Metadata = {
  title: "Mạng Xã Hội",
  title: "Astra",
  description: "Astra — một không gian yên bình, ma mị để kết nối và chia sẻ",
  keywords: ["Astra", "social", "mạng xã hội", "chill"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#f4efe6" />
      </head>
      <body className="bg-background dark:bg-background-dark text-primary dark:text-primary-dark transition-colors">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
