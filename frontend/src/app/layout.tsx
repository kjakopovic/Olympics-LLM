import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympus",
  description: "All your Olymic needs in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
