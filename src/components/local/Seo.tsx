"use client";

import Head from "next/head";
import { usePathname } from "next/navigation";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  canonicalUrl?: string;
};

export default function Seo({
  title,
  description,
  image = "/white-logo.jpg",
  siteName = "My Site",
  canonicalUrl,
}: SeoProps) {
  const pathname = usePathname();
  const url = canonicalUrl ?? `https://yourdomain.com${pathname}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
