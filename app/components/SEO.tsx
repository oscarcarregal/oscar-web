import React from 'react';
import type { SiteConfig } from '../lib/data';

export function LocalBusinessSEO({ config }: { config: SiteConfig }) {
  let phone = config.business.phoneNumber;
  if (!phone || phone === "-" || phone.trim() === "") phone = "600670867";
  
  let email = config.business.email;
  if (!email || email === "<>" || email === "-" || email.trim() === "") email = "oscarcarregalfontaneria@gmail.com";

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Plumber", "HomeAndConstructionBusiness"],
    "name": config.business.brandName || "Oscar Carregal",
    "description": "Fontanero en Donosti (San Sebastián) con más de 15 años de experiencia. Servicios de fontanería, gas, calefacción y reformas integrales en Gipuzkoa.",
    "image": "https://www.oscarcarregal.es/assets/logo_sin_fondo.png",
    "@id": "https://www.oscarcarregal.es",
    "url": "https://www.oscarcarregal.es",
    "telephone": `+34${phone}`,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.storeAddress.street || "Avenida de Tolosa, 89, Local 1",
      "addressLocality": "Donostia / San Sebastián",
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
      },
      "Donosti"
    ],
    "openingHours": ["Mo-Fr 08:00-19:00", "Sa 09:00-12:00"],
    "sameAs": [
      config.business.instagram?.url || "https://www.instagram.com/oscarcarregal_fontaneria/",
      config.storeAddress.mapsQuery?.startsWith("http") ? config.storeAddress.mapsQuery : "https://maps.app.goo.gl/6HYDD7UbkvXhBi5L9"
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
            "description": "Instalaciones sanitarias, reparación de averías, montantes de agua y bajantes comunitarias en Donostia-San Sebastián"
          },
          "url": "https://www.oscarcarregal.es/#servicios"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Instalación de gas en Donostia",
            "description": "Empresa autorizada. Instalación de calderas y calentadores de gas, certificados y alta en industria"
          },
          "url": "https://www.oscarcarregal.es/#servicios"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Calefacción y climatización en Gipuzkoa",
            "description": "Instalación de radiadores, suelo radiante, sistemas eficientes y aire acondicionado"
          },
          "url": "https://www.oscarcarregal.es/#servicios"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reformas integrales en San Sebastián",
            "description": "Reformas de baños, cocinas, pisos y locales en Donostia y alrededores con coordinación de gremios"
          },
          "url": "https://www.oscarcarregal.es/#servicios"
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData).replace(/</g, '\\u003c') }}
    />
  );
}
