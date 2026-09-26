import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bano Qabil AI Service Desk",
  description: "Bano Qabil AI Service Desk",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}