import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Fihaonankabary | Sehatry ny kabary Malagasy",
  description: "Ny fombantsika, ny hambom-pontsika. Ho an'ny kabary sy ny kolontsaina Malagasy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mg">
      <body className={`${plusJakarta.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
