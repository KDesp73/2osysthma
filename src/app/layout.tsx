import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/local/Layout";

export const metadata: Metadata = {
  title: "2ο Σύστημα Προσκόπων Κιλκίς",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="el">
          <body>
              <Layout>{children}</Layout>
          </body>
      </html>
  );
}
