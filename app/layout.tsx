import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { HomeButton } from "@/components/home-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "UContas",
  description: "Gerenciamento de finanças pessoais",
  icons: {
    icon: "/letra-u.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center ">
              <nav className="w-full flex justify-between border-b border-b-foreground/10 h-16 items-center">
                <HomeButton />
                <div className="w-full max-w-5xl flex justify-end p-0 px-0 md:p-3 md:px-5 text-sm gap-2">
                  {!hasEnvVars ? (
                    <EnvVarWarning />
                  ) : (
                    <Suspense>
                      <AuthButton />
                    </Suspense>
                  )}
                  <ThemeSwitcher />
                </div>
              </nav>
              <div className="w-full  p-5 ">{children}</div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
