import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Room Service — Hotel Araguaia Palace",
  description:
    "Peça pizza e bebida direto para o seu quarto no Hotel Araguaia Palace. Avisamos por WhatsApp assim que o pedido estiver pronto.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Room Service",
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
