'use client';

import Script from 'next/script';

// This component is a placeholder for your Google Analytics and Tag Manager scripts.
// 1. Get your Measurement ID from your Google Analytics property (e.g., G-XXXXXXXXXX).
// 2. Replace 'G-XXXXXXXXXX' in both Script components below with your actual ID.

export function GoogleAnalytics() {
  const measurementId = 'G-XXXXXXXXXX'; // <-- REPLACE WITH YOUR MEASUREMENT ID

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="google-tag-manager-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="google-analytics-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
