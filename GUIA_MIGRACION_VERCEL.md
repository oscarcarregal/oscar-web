# 🚀 Guía Definitiva: Adaptar la web para Vercel (Paso a Paso)

Esta guía está diseñada para que cualquier persona, sin importar su nivel de experiencia en programación, pueda solucionar el problema de guardado de datos y fotos en Vercel.

## ❓ ¿Por qué ocurre esto?
Vercel utiliza un sistema llamado "Serverless" (sin servidor fijo). Esto significa que tu web se ejecuta en un sistema de **solo lectura**. No se pueden crear ni modificar archivos (como guardar en `presupuestos.json` o subir un archivo `.jpg` a una carpeta) una vez que la web está publicada.

1. **Upstash (Redis):** Para guardar textos (presupuestos, configuración, datos de las reformas). Es la base de datos oficial que se integra con Vercel.
2. **Vercel Blob (Nube de archivos):** Para guardar las imágenes que subas.

---

## PASO 1: Configurar Vercel desde el navegador (Sin tocar código)

Vamos a activar estos servicios en tu cuenta de Vercel. Es gratuito.

1. Entra en [Vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en tu proyecto (`oscar-carregal-fontaneria`).
3. En el menú superior, haz clic en la pestaña **Storage** (Almacenamiento).
4. **Crear la Base de Datos (Redis):**
   - Haz clic en el botón **Create Database** o **Browse Store**.
   - Selecciona **Upstash** (a veces aparece como **Redis**) y dale a Continue o Add.
   - Dale un nombre (ej. `oscar-redis`) y selecciona una región cercana a España (ej. `fra1` Frankfurt o `cdg1` París).
   - Haz clic en **Create**.
   - Te preguntará si quieres conectarla a tu proyecto. Haz clic en **Connect**.
5. **Crear el Almacén de Imágenes (Blob):**
   - Vuelve a la pestaña **Storage**.
   - Haz clic en **Create Database** nuevamente.
   - Selecciona **Blob** y dale a Continue.
   - Dale un nombre (ej. `oscar-blob`) y la misma región.
   - Haz clic en **Create** y luego en **Connect** para vincularla a tu proyecto.

> ¡Listo! Al darle a "Connect", Vercel ha añadido automáticamente las "contraseñas" secretas a tu proyecto en la nube.

---

## PASO 2: Preparar tu ordenador local

Ahora vamos a instalar las herramientas en tu ordenador para que el código pueda comunicarse con Vercel.

1. Abre tu terminal (donde normalmente escribes `npm run dev`) y apaga el servidor si está encendido pulsando `Ctrl + C`.
2. Instala las librerías oficiales de Vercel copiando y pegando este comando, y pulsa Enter:
   ```bash
   npm install @upstash/redis @vercel/blob
   ```
3. Ahora necesitamos descargar las "contraseñas" de Vercel a tu ordenador para poder probar la web localmente. Ejecuta:
   ```bash
   npx vercel env pull .env.local
   ```
   *(Si es la primera vez, te pedirá iniciar sesión en Vercel y enlazar tu carpeta. Responde `Y` a las preguntas que te haga).*

---

## PASO 3: Migrar los datos de Archivos Locales a Upstash Redis

Aquí es donde reemplazaremos la lectura y escritura de archivos físicos por la base de datos de Vercel. 

Te muestro el ejemplo de cómo cambiar el guardado de presupuestos. El concepto se repite para las reformas y la configuración.

### 3.1. Modificar `app/api/presupuesto/route.ts`

**Abre el archivo** `app/api/presupuesto/route.ts` en tu editor de código.

**1. Arriba del todo, cambia las importaciones:**
Elimina las líneas que importan `fs` (file system) e importa `kv`:

```typescript
// ❌ ELIMINA ESTO:
// import fs from "fs/promises";
// import path from "path";
// const PRESUPUESTOS_PATH = path.join(process.cwd(), "data", "presupuestos.json");

// ✅ AÑADE ESTO:
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
```

**2. Ve al final del archivo, a la sección donde se guarda el presupuesto:**
Vamos a cambiar la forma en la que lee y escribe.

```typescript
// ❌ ELIMINA ESTO (Bloque de try...catch con fs.readFile y fs.writeFile):
// let data: StoredPresupuesto[] = [];
// try {
//   const raw = await fs.readFile(PRESUPUESTOS_PATH, "utf-8");
//   const parsed = JSON.parse(raw);
//   data = Array.isArray(parsed) ? parsed : [];
// } catch { }
// data.unshift(presupuesto);
// await fs.mkdir(path.dirname(PRESUPUESTOS_PATH), { recursive: true });
// await fs.writeFile(PRESUPUESTOS_PATH, JSON.stringify(data, null, 2), "utf-8");

// ✅ REEMPLÁZALO POR ESTO:
let data = await redis.get<StoredPresupuesto[]>("presupuestos") || [];
if (!Array.isArray(data)) data = [];

data.unshift(presupuesto);

// Guarda el array actualizado en la base de datos de Vercel
await redis.set("presupuestos", data);
```

*Nota: Este mismo proceso hay que repetirlo en `app/api/admin/presupuestos/route.ts`, cambiando `fs.readFile` por `redis.get` y `fs.writeFile` por `redis.set`.*

---

## PASO 4: Migrar la subida de imágenes a Vercel Blob

Actualmente, las imágenes se guardan en la carpeta `public/tienda/` o `public/reformas/`. En Vercel, esto debe ir a la nube (Blob).

### 4.1. Modificar `app/api/admin/tienda/images/route.ts`

**1. Cambia las importaciones:**
```typescript
// ❌ ELIMINA ESTO:
// import fs from "fs/promises";
// import path from "path";

// ✅ AÑADE ESTO:
import { put, del } from "@vercel/blob";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
```

**2. En la función `POST` (Subir foto):**
Encuentra el bucle `for (const file of files)` donde se guarda el archivo:

```typescript
// ❌ ELIMINA ESTO:
// const filePath = path.join(TIENDA_DIR, safeName);
// await fs.writeFile(filePath, buffer);
// savedPhotos.push({ src: `/tienda/${safeName}`, alt: "" });

// ✅ REEMPLÁZALO POR ESTO:
// Sube el archivo a Vercel Blob y obtiene una URL pública
const blob = await put(`tienda/${safeName}`, buffer, { 
  access: 'public',
  contentType: file.type // Opcional, pero recomendado
});

// Guardamos la URL de internet que nos da Vercel
savedPhotos.push({ src: blob.url, alt: "" });
```

**3. En la función `DELETE` (Borrar foto):**
```typescript
// ❌ ELIMINA ESTO:
// const filePath = path.join(TIENDA_DIR, safeName);
// await fs.unlink(filePath).catch(() => {});

// ✅ REEMPLÁZALO POR ESTO:
// Usamos el 'src' directamente (que ahora será una URL de Blob)
await del(src).catch(() => console.error("Error borrando blob"));
```

---

## PASO 5: Actualizar la carga de datos públicos (`data.ts`)

La web pública carga los datos desde los archivos locales. Ahora debe pedirlos a la API o directamente a KV.

Abre `app/lib/data.ts`.

```typescript
// ❌ ELIMINA ESTO:
// export async function fetchConfig(): Promise<SiteConfig> {
//   const url = "/config.json";
//   const res = await fetch(url);
//   return parseJsonOrThrow<SiteConfig>(res, url);
// }

// ✅ REEMPLÁZALO POR ESTO:
import { Redis } from "@upstash/redis";

export async function fetchConfig(): Promise<SiteConfig> {
  const redis = Redis.fromEnv();
  // Intentamos leer de la base de datos primero
  const data = await redis.get<SiteConfig>("site:config");
  if (data) return data;
  
  // Si KV está vacío (primera vez), cargamos el archivo por defecto local
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/config.json`);
  return parseJsonOrThrow<SiteConfig>(res, "/config.json");
}
```

*Haz lo mismo para la función `fetchAllReformas()` usando `redis.get("reformas")`.*

---

## 🚦 ¿Y AHORA QUÉ?

Hemos visto el patrón exacto a seguir, pero debes aplicar estos cambios a **todas las rutas de la carpeta `app/api/admin/`** para que toda la web sea compatible.

### Si te parece demasiado técnico o largo:
¡No te preocupes! Como soy tu asistente de inteligencia artificial, **puedo aplicar todos estos cambios de código por ti automáticamente en unos segundos.** Solo tienes que responderme en el chat: 

> *"Por favor, aplica todos los cambios de Vercel Upstash y Blob en el código por mí."*

### Si prefieres hacerlo tú mismo:
1. Revisa todos los archivos dentro de `app/api/`.
2. Donde veas `fs.readFile` / `fs.writeFile`, cámbialo por `redis.get` / `redis.set`.
3. Donde veas que se guarda una imagen (`Buffer.from(...)`), cámbialo por `put(nombre, buffer, { access: 'public' })` de `@vercel/blob`.
4. Ejecuta `npm run build` en tu consola para asegurarte de que no hay errores tipográficos.
5. Sube tus cambios a GitHub y Vercel se actualizará automáticamente.
