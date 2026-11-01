import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTM OS // Autonomous Customer Discovery Engine",
  description: "Turn any product URL into an evidence-backed pipeline of potential customers with live buying signals. Powered by TinyFish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08090D] text-[#E9E9E7] min-h-screen">
        {children}
      </body>
    </html>
  );
}
