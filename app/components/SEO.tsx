import React from 'react';
import type { SiteConfig } from '../lib/data';

export function LocalBusinessSEO({ config }: { config: SiteConfig }) {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Plumber", "HomeAndConstructionBusiness"],
    "name": config.business.brandName || "Oscar Carregal",
    "description": "Fontanero profesional en San Sebastián (Donostia). Servicios de fontanería, gas, calefacción y reformas integrales en Gipuzkoa. Más de 15 años de experiencia.",
    "image": "https://oscarcarregal.es/assets/logo_sin_fondo.png",
    "@id": "https://oscarcarregal.es",
    "url": "https://oscarcarregal.es",
    "telephone": `+34${config.business.phoneNumber || "600670867"}`,
    "email": config.business.email || "oscarcarregalfontaneria@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.storeAddress.street || "Avenida de Tolosa 89",
      "addressLocality": "San Sebastián",
      "postalCode": config.storeAddress.postalCode || "20018",
      "addressRegion": "Gipuzkoa",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.3082,
      "longitude": -2.0089
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "San Sebastián",
        "alternateName": "Donostia"
      },
      {
        "@type": "State",
        "name": "Gipuzkoa"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/oscarcarregal_fontaneria/"
    ],
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "12:00"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios de fontanería y reformas en San Sebastián",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fontanería en San Sebastián",
            "description": "Instalaciones sanitarias, montantes de agua y bajantes comunitarias en Donostia-San Sebastián"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Instalación de gas en Donostia",
            "description": "Empresa autorizada. Instalación de calderas y calentadores de gas, certificados y alta en industria"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Calefacción y climatización en Gipuzkoa",
            "description": "Instalación de radiadores, suelo radiante y aire acondicionado"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reformas integrales en San Sebastián",
            "description": "Reformas de baños, cocinas, pisos y locales en Donostia y alrededores"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
    />
  );
}
