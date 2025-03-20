import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Audiowide } from "next/font/google";

// Используем шрифт Audiowide из Google Fonts
const audiowide = Audiowide({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-audiowide',
});

export const metadata = {
  title: "TERCELO",
  description: "Сервис транскрипции аудио в текст",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          audiowide.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
