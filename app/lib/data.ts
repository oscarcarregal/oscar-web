/* ─── Tipos para los datos JSON del sitio ─── */

export interface ReformaInfo {
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

export interface ReformaProject extends ReformaInfo {
  id: string;
  imagePaths: string[];
}

export interface HeroSlide {
  reforma: string;
  image: string;
  caption: string;
}

export interface StorePhoto {
  src: string;
  alt: string;
}

export interface StoreAddress {
  street: string;
  postalCode: string;
  city: string;
  region: string;
  serviceArea: string;
  mapsQuery: string;
}

export interface BusinessConfig {
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
}

export interface FooterConfig {
  description: string;
  copyrightLine: string;
  copyrightNote: string;
}

export interface SiteConfig {
  business: BusinessConfig;
  storeAddress: StoreAddress;
  storePhotos: StorePhoto[];
  footer: FooterConfig;
  tags: string[];
  featuredReformas: string[];
  heroCarousel: HeroSlide[];
}

/* ─── Helpers de fetch (cliente) ─── */

async function parseJsonOrThrow<T>(res: Response, url: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Invalid JSON response for ${url}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchConfig(): Promise<SiteConfig> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/config`;
  const res = await fetch(url, { cache: 'no-store' }); // Ensure fresh data from Redis
  return parseJsonOrThrow<SiteConfig>(res, url);
}

/* Carga todas las reformas del fichero centralizado */
export async function fetchAllReformas(): Promise<ReformaProject[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/reformas`;
  const res = await fetch(url, { cache: 'no-store' });
  const raw = await parseJsonOrThrow<(ReformaInfo & { id: string })[]>(res, url);

  return raw.map((r) => ({
    ...r,
    imagePaths: r.images.map((img) => img.startsWith("http") ? img : `/reformas/${r.id}/${img}`),
  }));
}

/* Filtra por IDs concretos (para featured, etc.) */
export async function fetchReformas(ids: string[]): Promise<ReformaProject[]> {
  const all = await fetchAllReformas();
  const idSet = new Set(ids);
  return all.filter((r) => idSet.has(r.id));
}
