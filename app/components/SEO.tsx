import React from 'react';
import type { SiteConfig } from '../lib/data';

export function LocalBusinessSEO({ config }: { config: SiteConfig }) {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Plumber", "HomeAndConstructionBusiness"],
    "name": config.business.brandName,
    "image": "https://oscarcarregal.es/assets/logo_sin_fondo.png",
    "@id": "https://oscarcarregal.es",
    "url": "https://oscarcarregal.es",
    "telephone": `+34${config.business.phoneNumber}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.storeAddress.street,
      "addressLocality": config.storeAddress.city,
      "postalCode": config.storeAddress.postalCode,
      "addressRegion": config.storeAddress.region,
      "addressCountry": "ES"
    },
    // Si tenemos coordenadas fijas o las extraemos de algun lado. 
    // Como default usamos San Sebastián
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.3082,
      "longitude": -2.0089
    },
    "areaServed": [
      {
        "@type": "City",
        "name": config.storeAddress.city
      },
      {
        "@type": "State",
        "name": config.storeAddress.region
      }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "19:00"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
    />
  );
}
