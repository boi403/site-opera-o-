import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "LavaPronto — Lavanderia do Hotel",
  description:
    "Reserve sua lavagem de roupa no LavaPronto: para hóspedes, moradores da cidade e empresas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LavaPronto",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#002D44",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <RegisterSW />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
