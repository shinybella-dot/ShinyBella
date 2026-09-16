import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShinyBella - Tu cita de belleza en un clic",
  description: "Encuentra, agenda y paga tus servicios de belleza favoritos en Santa Ana. Salones, barberías y cosmetólogas cerca de ti.",
  keywords: "belleza, salon, barberia, cita, agendamiento, Santa Ana, El Salvador",
  authors: [{ name: "ShinyBella Team" }],
  openGraph: {
    title: "ShinyBella - Tu cita de belleza en un clic",
    description: "Encuentra, agenda y paga tus servicios de belleza favoritos",
    locale: "es_SV",
    siteName: "ShinyBella",
  },
};

export const viewport: Viewport = {
  themeColor: "#525871",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-light text-foreground">
        {children}
      </body>
    </html>
  );
}