const fs = require('fs');

const generateHTML = (title, themeOverrides, colorClasses) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style type="text/tailwindcss">
    @theme {
      --font-heading: 'DM Serif Display', serif;
      --font-body: 'Outfit', sans-serif;
      ${themeOverrides}
    }
    body { font-family: var(--font-body); scroll-behavior: smooth; }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: 400; }
    .decorative-line {
      display: block; width: 48px; height: 2px;
      background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
      border-radius: 1px;
    }
    .hover-glow:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 8px 40px -8px rgba(0,0,0,0.3); }
    .text-gradient-accent {
      background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body class="${colorClasses.bgMain} ${colorClasses.textMain} antialiased">

  <!-- NAVBAR -->
  <nav class="sticky top-0 z-50 ${colorClasses.navBg} backdrop-blur-xl border-b ${colorClasses.borderClass}">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2 group">
        <span class="text-3xl font-heading font-bold ${colorClasses.textHeading} transition-transform group-hover:scale-105">OC</span>
        <div class="flex flex-col">
          <span class="text-sm font-bold leading-none tracking-widest ${colorClasses.textHeading}">OSCAR CARREGAL</span>
          <span class="text-[0.45rem] tracking-[0.2em] uppercase ${colorClasses.textMuted} mt-0.5">Fontanería & Reformas</span>
        </div>
      </div>
      <div class="hidden items-center gap-6 lg:flex text-sm font-medium">
        <a href="#trabajos" class="${colorClasses.textAccent} border-b-2 border-accent pb-1">Trabajos</a>
        <a href="#servicios" class="${colorClasses.textMuted} hover:${colorClasses.textHeading} transition-colors">Servicios</a>
        <a href="#nosotros" class="${colorClasses.textMuted} hover:${colorClasses.textHeading} transition-colors">Nosotros</a>
        <a href="#ubicacion" class="${colorClasses.textMuted} hover:${colorClasses.textHeading} transition-colors">Ubicación</a>
        <a href="#contacto" class="${colorClasses.textMuted} hover:${colorClasses.textHeading} transition-colors">Contacto</a>
        <div class="ml-2 h-5 w-px ${colorClasses.borderClass}"></div>
        <a href="#contacto" class="ml-2 rounded-full ${colorClasses.bgAccent} px-6 py-2.5 ${colorClasses.textAccentContrast} font-semibold hover:opacity-90 transition-all shadow-lg">
          Tu Proyecto <i data-lucide="arrow-up-right" class="inline w-4 h-4 mb-0.5"></i>
        </a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden ${colorClasses.bgDark} text-white">
    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000')] bg-cover bg-center opacity-30 grayscale mix-blend-overlay"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#111]/80 via-[#111]/50 to-[#111]/90"></div>
    
    <div class="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-6 pb-20 text-center mt-8">
      <span class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium tracking-widest uppercase text-white/70 backdrop-blur-sm">
        <span class="h-1.5 w-1.5 rounded-full ${colorClasses.bgAccent} animate-pulse"></span>
        Más de 15 años de experiencia
      </span>

      <h1 class="font-heading max-w-5xl text-5xl leading-[1.1] tracking-tight drop-shadow-lg md:text-7xl">
        Tu reforma de sueños,<br />
        <span class="text-gradient-accent">hecha realidad</span>
      </h1>

      <p class="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">
        Fontanería, gas, calefacción y reformas integrales con los mejores
        materiales y un acabado impecable.
      </p>

      <div class="mt-12 flex flex-col gap-4 sm:flex-row">
        <a href="#contacto" class="inline-flex items-center justify-center gap-2 rounded-full ${colorClasses.bgAccent} px-8 py-4 text-base font-semibold ${colorClasses.textAccentContrast} transition-all hover:scale-105 shadow-xl">
          Cuéntame tu proyecto <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
        <a href="#servicios" class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-medium text-white transition-all hover:bg-white/20">
          Ver Servicios
        </a>
      </div>

      <div class="mt-20 flex items-center gap-8 sm:gap-14">
        <div class="text-center"><p class="text-3xl font-bold text-white drop-shadow">50+</p><p class="mt-1 text-[11px] font-medium tracking-widest uppercase text-white/40">Proyectos</p></div>
        <div class="text-center"><p class="text-3xl font-bold text-white drop-shadow">15+</p><p class="mt-1 text-[11px] font-medium tracking-widest uppercase text-white/40">Años exp.</p></div>
        <div class="text-center"><p class="text-3xl font-bold text-white drop-shadow">100%</p><p class="mt-1 text-[11px] font-medium tracking-widest uppercase text-white/40">Garantía</p></div>
      </div>
    </div>
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="scroll-mt-20 ${colorClasses.bgAlt} py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.textAccent}">Nuestros Servicios</span>
        <h2 class="mt-4 text-4xl ${colorClasses.textHeading}">Soluciones profesionales<br/>para tu hogar</h2>
        <span class="mx-auto mt-6 decorative-line"></span>
        <p class="mt-6 text-base leading-relaxed ${colorClasses.textMuted}">Cubrimos todas las necesidades de tu vivienda con un equipo cualificado y materiales de primera calidad.</p>
      </div>

      <div class="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Tarjeta 1 -->
        <div class="group relative overflow-hidden rounded-2xl ${colorClasses.bgCard} p-8 shadow-sm transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-light"></div>
          <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <i data-lucide="droplets" class="${colorClasses.textAccent}"></i>
          </div>
          <h3 class="text-xl ${colorClasses.textHeading}">Fontanería</h3>
          <p class="mt-3 text-sm leading-relaxed ${colorClasses.textMuted}">Instalaciones sanitarias en viviendas y locales, montantes de agua, bajantes comunitarias.</p>
        </div>
        <!-- Tarjeta 2 -->
        <div class="group relative overflow-hidden rounded-2xl ${colorClasses.bgCard} p-8 shadow-sm transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-light"></div>
          <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <i data-lucide="flame" class="${colorClasses.textAccent}"></i>
          </div>
          <h3 class="text-xl ${colorClasses.textHeading}">Gas</h3>
          <p class="mt-3 text-sm leading-relaxed ${colorClasses.textMuted}">Empresa autorizada, Instalacion de calderas y calentadores de gas, certificados y alta en industria.</p>
        </div>
        <!-- Tarjeta 3 -->
        <div class="group relative overflow-hidden rounded-2xl ${colorClasses.bgCard} p-8 shadow-sm transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-light"></div>
          <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <i data-lucide="thermometer" class="${colorClasses.textAccent}"></i>
          </div>
          <h3 class="text-xl ${colorClasses.textHeading}">Calefacción</h3>
          <p class="mt-3 text-sm leading-relaxed ${colorClasses.textMuted}">Instalacion de radiadores, suelo radiante y aire acondicionado.</p>
        </div>
        <!-- Tarjeta 4 -->
        <div class="group relative overflow-hidden rounded-2xl ${colorClasses.bgCard} p-8 shadow-sm transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-light"></div>
          <div class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <i data-lucide="hammer" class="${colorClasses.textAccent}"></i>
          </div>
          <h3 class="text-xl ${colorClasses.textHeading}">Reformas</h3>
          <p class="mt-3 text-sm leading-relaxed ${colorClasses.textMuted}">Reformas de cuartos de baños, cocinas pisos y locales, coordinación de gremios.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PORTFOLIO -->
  <section id="trabajos" class="scroll-mt-20 ${colorClasses.bgMain} py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.textAccent}">Nuestros Trabajos</span>
        <h2 class="mt-4 text-4xl ${colorClasses.textHeading}">Reformas que hablan<br/>por sí solas</h2>
        <span class="mx-auto mt-6 decorative-line"></span>
        <p class="mt-6 text-base leading-relaxed ${colorClasses.textMuted}">Proyectos reales de nuestros clientes.</p>
      </div>

      <div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Proyecto 1 -->
        <div class="group flex flex-col overflow-hidden rounded-2xl ${colorClasses.bgCard} shadow-md transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="relative h-64 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800" alt="Cocina" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div class="flex flex-1 flex-col p-7">
            <h3 class="text-xl ${colorClasses.textHeading} group-hover:${colorClasses.textAccent} transition-colors">Reforma Cocina Moderna</h3>
            <p class="mt-3 flex-1 text-sm leading-relaxed ${colorClasses.textMuted}">Diseño abierto con isla central y acabados premium en tonos neutros.</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span class="rounded-full ${colorClasses.bgAlt} px-3 py-1 text-[11px] font-medium tracking-wide ${colorClasses.textMain}">Cocinas</span>
            </div>
          </div>
        </div>
        <!-- Proyecto 2 -->
        <div class="group flex flex-col overflow-hidden rounded-2xl ${colorClasses.bgCard} shadow-md transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="relative h-64 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800" alt="Baño" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div class="flex flex-1 flex-col p-7">
            <h3 class="text-xl ${colorClasses.textHeading} group-hover:${colorClasses.textAccent} transition-colors">Baño Elegante</h3>
            <p class="mt-3 flex-1 text-sm leading-relaxed ${colorClasses.textMuted}">Sustitución de bañera por plato de ducha y grifería empotrada.</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span class="rounded-full ${colorClasses.bgAlt} px-3 py-1 text-[11px] font-medium tracking-wide ${colorClasses.textMain}">Baños</span>
            </div>
          </div>
        </div>
        <!-- Proyecto 3 -->
        <div class="group flex flex-col overflow-hidden rounded-2xl ${colorClasses.bgCard} shadow-md transition-all hover-glow hover:-translate-y-1 border ${colorClasses.borderClass}">
          <div class="relative h-64 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800" alt="Integral" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div class="flex flex-1 flex-col p-7">
            <h3 class="text-xl ${colorClasses.textHeading} group-hover:${colorClasses.textAccent} transition-colors">Reforma Integral Piso</h3>
            <p class="mt-3 flex-1 text-sm leading-relaxed ${colorClasses.textMuted}">Renovación completa de vivienda, fontanería, electricidad y suelos.</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span class="rounded-full ${colorClasses.bgAlt} px-3 py-1 text-[11px] font-medium tracking-wide ${colorClasses.textMain}">Integral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- POR QUÉ ELEGIRNOS -->
  <section id="nosotros" class="scroll-mt-20 ${colorClasses.bgAlt} py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.textAccent}">¿Por qué elegirnos?</span>
          <h2 class="mt-4 text-4xl ${colorClasses.textHeading}">La diferencia está<br/>en los detalles</h2>
          <span class="mt-6 decorative-line"></span>
          <p class="mt-6 text-base leading-relaxed ${colorClasses.textMuted}">No somos una empresa más. Nos tomamos cada proyecto como si fuera nuestro propio hogar.</p>
          
          <div class="mt-12 space-y-8">
            <div class="flex gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="shield-check" class="${colorClasses.textAccent}"></i></div>
              <div>
                <h3 class="text-lg ${colorClasses.textHeading}">Calidad Premium</h3>
                <p class="mt-1.5 text-sm leading-relaxed ${colorClasses.textMuted}">Trabajamos solo con marcas líderes. Cada proyecto incluye garantía.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="sparkles" class="${colorClasses.textAccent}"></i></div>
              <div>
                <h3 class="text-lg ${colorClasses.textHeading}">Limpieza Absoluta</h3>
                <p class="mt-1.5 text-sm leading-relaxed ${colorClasses.textMuted}">Dejamos tu hogar impecable tras cada trabajo.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="calendar-check" class="${colorClasses.textAccent}"></i></div>
              <div>
                <h3 class="text-lg ${colorClasses.textHeading}">Plazos Cumplidos</h3>
                <p class="mt-1.5 text-sm leading-relaxed ${colorClasses.textMuted}">Planificamos al detalle y nos comprometemos con la fecha de entrega.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="relative overflow-hidden rounded-3xl ${colorClasses.bgDark} p-10 text-white shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div class="relative">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <span class="text-3xl font-bold font-heading ${colorClasses.textAccent}">OC</span>
            </div>
            <h3 class="mt-8 text-center text-3xl">Más de 15 años cuidando hogares</h3>
            <p class="mt-4 text-center text-sm leading-relaxed text-white/50">Desde instalaciones sencillas hasta reformas integrales.</p>
            <div class="mt-8 flex justify-center gap-1.5">
              <i data-lucide="star" class="${colorClasses.textAccent} fill-current w-5 h-5"></i>
              <i data-lucide="star" class="${colorClasses.textAccent} fill-current w-5 h-5"></i>
              <i data-lucide="star" class="${colorClasses.textAccent} fill-current w-5 h-5"></i>
              <i data-lucide="star" class="${colorClasses.textAccent} fill-current w-5 h-5"></i>
              <i data-lucide="star" class="${colorClasses.textAccent} fill-current w-5 h-5"></i>
            </div>
            <p class="mt-2 text-center text-xs tracking-wide text-white/40">Valoración media de nuestros clientes</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="relative overflow-hidden ${colorClasses.bgDark} py-24 text-center">
    <div class="relative z-10 mx-auto max-w-4xl px-6">
      <h2 class="text-4xl text-white">¿Listo para transformar <span class="text-gradient-accent">tu hogar?</span></h2>
      <p class="mx-auto mt-6 max-w-xl text-base text-white/50">Cuéntame tu proyecto y me pondré en contacto contigo para darte una respuesta personalizada.</p>
      <div class="mt-10 flex justify-center gap-4">
        <a href="#contacto" class="inline-flex items-center gap-2 rounded-full ${colorClasses.bgAccent} px-8 py-4 text-base font-semibold ${colorClasses.textAccentContrast} hover:scale-105 transition-transform"><i data-lucide="phone" class="w-5 h-5"></i> Llamar Ahora</a>
        <a href="#contacto" class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors"><i data-lucide="mail" class="w-5 h-5"></i> Tu Proyecto</a>
      </div>
    </div>
  </section>

  <!-- CONTACTO -->
  <section id="contacto" class="scroll-mt-20 ${colorClasses.bgMain} py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div class="text-center">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.textAccent}">Contacto</span>
        <h2 class="mt-4 text-4xl ${colorClasses.textHeading}">Hablemos de tu proyecto</h2>
        <span class="mx-auto mt-6 decorative-line"></span>
      </div>
      <div class="mt-16 grid gap-8 lg:grid-cols-3">
        <div class="flex flex-col items-center rounded-2xl ${colorClasses.bgAlt} p-10 text-center shadow-sm border ${colorClasses.borderClass}">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="phone" class="${colorClasses.textAccent}"></i></div>
          <h3 class="mt-5 text-xl ${colorClasses.textHeading}">Teléfono</h3>
          <p class="mt-2 text-sm font-medium ${colorClasses.textMain}">600 000 000</p>
          <p class="mt-1 text-xs ${colorClasses.textMuted}">L-V 08:00 - 19:00</p>
        </div>
        <div class="flex flex-col items-center rounded-2xl ${colorClasses.bgAlt} p-10 text-center shadow-sm border ${colorClasses.borderClass}">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="mail" class="${colorClasses.textAccent}"></i></div>
          <h3 class="mt-5 text-xl ${colorClasses.textHeading}">Email</h3>
          <p class="mt-2 text-sm font-medium ${colorClasses.textMain}">info@oscarcarregal.com</p>
          <p class="mt-1 text-xs ${colorClasses.textMuted}">Respuesta en 24h</p>
        </div>
        <div class="flex flex-col items-center rounded-2xl ${colorClasses.bgAlt} p-10 text-center shadow-sm border ${colorClasses.borderClass}">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10"><i data-lucide="map-pin" class="${colorClasses.textAccent}"></i></div>
          <h3 class="mt-5 text-xl ${colorClasses.textHeading}">Ubicación</h3>
          <p class="mt-2 text-sm font-medium ${colorClasses.textMain}">Gipuzkoa</p>
          <p class="mt-1 text-xs ${colorClasses.textMuted}">País Vasco</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="${colorClasses.bgDark} text-white/60 py-12 text-center text-sm border-t border-white/10">
    <div class="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-heading font-bold ${colorClasses.textAccent}">OC</span>
        <span class="font-bold tracking-widest text-white">OSCAR CARREGAL</span>
      </div>
      <p>&copy; 2026 Oscar Carregal. Todos los derechos reservados.</p>
    </div>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>
`;

// Mockup 5: Original Base layout with Blue accents instead of Copper
const mockup5 = generateHTML(
  "Mockup 5 Completo - Base Original con Acentos Azules",
  `
      --color-accent: #2A6FA8; /* Azul acero para reemplazar el cobre */
      --color-accent-light: #3b82f6;
  `,
  {
    bgMain: "bg-white",
    bgAlt: "bg-[#FAF8F5]", // Original Cream
    bgCard: "bg-white",
    bgDark: "bg-[#111111]", // Original Carbon
    navBg: "bg-white/95",
    textMain: "text-[#3A3A3A]", // Original Gray Dark
    textHeading: "text-[#111111]", // Carbon
    textMuted: "text-[#8A8A8A]", // Silver
    textAccent: "text-[#2A6FA8]", // Blue Accent
    bgAccent: "bg-[#1B4D7A]", // Darker Blue for buttons
    textAccentContrast: "text-white",
    borderClass: "border-gray-200/60"
  }
);

fs.writeFileSync('c:/Users/Ander/Desktop/juegos/yop/oscar-carregal/temp_mockups/mockup5_original_azul.html', mockup5);

console.log("Mockup 5 generated successfully.");
