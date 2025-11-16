import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./api/auth-context";
import "./globals.css";
import Header from "@/components/layout/header";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";
import Footer from "@/components/layout/footer";
import { AIChatButton } from "@/components/ui/ChatOpen";

export const metadata: Metadata = {
  title: "Dev",
  description: "Dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Header />
            <LayoutWrapper>{children}</LayoutWrapper>
            <Footer />
            {/* Добавлена эта строка ↓ */}
            <AIChatButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
