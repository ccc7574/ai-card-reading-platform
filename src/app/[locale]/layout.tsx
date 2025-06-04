import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { PWAInitializer } from '@/components/PWAInitializer';
import { locales, localeConfig } from '@/i18n/config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Card Reading - 智能卡片阅读",
  description: "高质量AI文章和KOL言论的卡片化阅读体验",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI卡片阅读"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" }
    ]
  }
};



// 生成静态参数
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  // 等待params
  const { locale } = await params;

  // 验证语言参数
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  // 获取语言配置
  const languageConfig = localeConfig[locale as keyof typeof localeConfig];

  return (
    <html lang={locale} dir={languageConfig.dir}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <PWAInitializer />
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
