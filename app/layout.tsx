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
import { LanguageSwitcher } from "@/components/language-switcher";
import { LanguageProvider } from "@/lib/i18n/context";
import { WalletProvider } from "@/lib/wallets/context";
import { WalletSwitcher } from "@/components/wallet-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "UContas",
  description: "Gerenciamento de finanças pessoais e empresariais",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <WalletProvider>
              <main className="min-h-screen flex flex-col items-center">
                <div className="flex-1 w-full flex flex-col items-center ">
                  <nav className="w-full flex justify-between border-b border-b-foreground/10 h-16 items-center px-2 sm:px-4">
                    <HomeButton />
                    <div className="flex items-center p-0 px-0 md:p-3 md:px-5 text-sm gap-2">
                      <WalletSwitcher />
                      {!hasEnvVars ? (
                        <EnvVarWarning />
                      ) : (
                        <Suspense>
                          <AuthButton />
                        </Suspense>
                      )}
                      <LanguageSwitcher />
                      <ThemeSwitcher />
                    </div>
                  </nav>
                  <div className="w-full p-4 sm:p-6">{children}</div>
                </div>
              </main>
            </WalletProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
