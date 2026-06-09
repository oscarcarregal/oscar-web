/* Validación y sanitización del payload de configuración del sitio */
import { sanitizeId } from "@/app/lib/admin-auth";

type JsonRecord = Record<string, unknown>;

interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}

function asString(value: unknown, maxLen: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, maxLen);
}

function asStringArray(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const normalized = item.trim().slice(0, maxLen);
    if (!normalized) continue;
    out.push(normalized);
    if (out.length >= maxItems) break;
  }

  return out;
}

function asSafeHttpUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }

  return "";
}

function asSafeEmail(value: unknown): string {
  const email = asString(value, 200);
  if (!email) return "";
  const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicEmail.test(email) ? email : "";
}

function asSafePhone(value: unknown): string {
  const phone = asString(value, 40);
  if (!phone) return "";
  const allowed = /^[0-9+()\-\s]{6,40}$/;
  return allowed.test(phone) ? phone : "";
}

function asSafeImagePath(value: unknown): string {
  const raw = asString(value, 300);
  if (!raw) return "";
  // Permitimos cualquier ruta que empiece por / o sea una URL segura, para no descartar imágenes legítimas
  if (raw.startsWith("/") || raw.startsWith("http")) return raw;
  // También permitimos rutas relativas si no contienen ..
  if (!raw.includes("..")) return raw;
  return "";
}

interface SanitizedSlide {
  reforma: string;
  image: string;
  caption: string;
}

interface SanitizedStorePhoto {
  src: string;
  alt: string;
}

interface SanitizedStoreAddress {
  street: string;
  postalCode: string;
  city: string;
  region: string;
  serviceArea: string;
  mapsQuery: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
}

interface SanitizedConfig {
  business: {
    brandName: string;
    brandTagline: string;
    phoneNumber: string;
    email: string;
    instagram: {
      url: string;
      handle: string;
    };
    schedule: {
      days: string;
      hours: string;
      compact: string;
    };
    responseTime: string;
    experience: string;
  };
  storeAddress: SanitizedStoreAddress;
  storePhotos: SanitizedStorePhoto[];
  footer: {
    description: string;
    copyrightLine: string;
    copyrightNote: string;
  };
  tags: string[];
  featuredReformas: string[];
  heroCarousel: SanitizedSlide[];
}

export function sanitizeConfigPayload(input: unknown): ValidationResult<SanitizedConfig> {
  const root = asRecord(input);
  if (!root) {
    return { ok: false, error: "Formato de configuración inválido" };
  }

  const business = asRecord(root.business);
  const footer = asRecord(root.footer);
  if (!business || !footer) {
    return { ok: false, error: "Faltan secciones obligatorias" };
  }

  const instagram = asRecord(business.instagram) ?? {};
  const schedule = asRecord(business.schedule) ?? {};

  // Dirección de la tienda (opcional, se crea vacía si no existe)
  const storeAddressRaw = asRecord(root.storeAddress) ?? {};
  const storeAddress: SanitizedStoreAddress = {
    street: asString(storeAddressRaw.street, 200),
    postalCode: asString(storeAddressRaw.postalCode, 20),
    city: asString(storeAddressRaw.city, 120),
    region: asString(storeAddressRaw.region, 180),
    serviceArea: asString(storeAddressRaw.serviceArea, 180),
    mapsQuery: asString(storeAddressRaw.mapsQuery, 500),
    mapsUrl: asSafeHttpUrl(storeAddressRaw.mapsUrl),
    mapsEmbedUrl: asSafeHttpUrl(storeAddressRaw.mapsEmbedUrl),
  };

  // Fotos de la tienda (máx 10 fotos)
  const storePhotosRaw = Array.isArray(root.storePhotos) ? root.storePhotos : [];
  const storePhotos: SanitizedStorePhoto[] = [];
  for (const item of storePhotosRaw) {
    const photo = asRecord(item);
    if (!photo) continue;
    const src = asSafeImagePath(photo.src);
    if (!src) continue;
    storePhotos.push({ src, alt: asString(photo.alt, 200) });
    if (storePhotos.length >= 10) break;
  }

  // Featured reformas — validar formato de ID
  const featuredRaw = asStringArray(root.featuredReformas, 100, 80);
  const featuredReformas = featuredRaw
    .map((id) => sanitizeId(id))
    .filter((id): id is string => Boolean(id));

  // Carousel del hero — validar formato de cada slide
  const heroRaw = Array.isArray(root.heroCarousel) ? root.heroCarousel : [];
  const heroCarousel: SanitizedSlide[] = [];
  for (const item of heroRaw) {
    const slide = asRecord(item);
    if (!slide) continue;

    const slideId = sanitizeId(asString(slide.reforma, 80));
    if (!slideId) continue;

    const image = asSafeImagePath(slide.image);
    if (!image) continue;

    heroCarousel.push({
      reforma: slideId,
      image,
      caption: asString(slide.caption, 240),
    });

    if (heroCarousel.length >= 100) break;
  }

  const sanitized: SanitizedConfig = {
    business: {
      brandName: asString(business.brandName, 120),
      brandTagline: asString(business.brandTagline, 180),
      phoneNumber: asSafePhone(business.phoneNumber),
      email: asSafeEmail(business.email),
      instagram: {
        url: asSafeHttpUrl(instagram.url),
        handle: asString(instagram.handle, 120),
      },
      schedule: {
        days: asString(schedule.days, 120),
        hours: asString(schedule.hours, 120),
        compact: asString(schedule.compact, 120),
      },
      location: {
        city: asString(location.city, 120),
        serviceArea: asString(location.serviceArea, 180),
        region: asString(location.region, 180),
      },
      responseTime: asString(business.responseTime, 180),
      experience: asString(business.experience, 180),
    },
    storeAddress,
    storePhotos,
    footer: {
      description: asString(footer.description, 1000),
      copyrightLine: asString(footer.copyrightLine, 180),
      copyrightNote: asString(footer.copyrightNote, 180),
    },
    tags: asStringArray(root.tags, 200, 60),
    featuredReformas,
    heroCarousel,
  };

  return { ok: true, data: sanitized };
}
