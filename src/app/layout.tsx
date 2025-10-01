import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/local/Layout";
import { Analytics } from "@vercel/analytics/next";
import Seo from "@/components/local/Seo";
<<<<<<< Updated upstream
=======
import { Noto_Serif } from "next/font/google";

const font = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-sans",
});
>>>>>>> Stashed changes

export const metadata: Metadata = {
  title: "2ο Σύστημα Προσκόπων Κιλκίς",
  description: "Η επίσημη ιστοσελίδα του 2ου Συστήματος Προσκόπων Κιλκίς",
  other: {
    "google-site-verification": "awtTRbjKmp55AeVdkTQtKScmYyLLBjuyB1o97M7oPEw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< Updated upstream
      <html lang="el">
          <Seo 
            title={metadata.title as string}
            description={metadata.description as string}
            image="/logo.jpg"
            siteName={metadata.title as string}
            canonicalUrl="https://2osysthmakilkis.gr"
          />
          <body>
              <Layout>
                {children}
                <Analytics />
              </Layout>
          </body>
      </html>
=======
    <html lang="el">
      <Seo
        title={metadata.title as string}
        description={metadata.description as string}
        image="/logo.jpg"
        siteName={metadata.title as string}
        canonicalUrl="https://2osysthmakilkis.gr"
      />
      <body className={`${font.variable} antialiased`}>
        <Layout>
          {children}
          <Analytics />
        </Layout>
      </body>
    </html>
>>>>>>> Stashed changes
  );
}
