/**
 * Contenido de la landing. Separado de los componentes para poder
 * editarlo (o moverlo a un CMS) sin tocar la UI.
 */

export const BRAND = {
  name: "Calma Café",
  tagline: "Café de especialidad",
} as const;

/** Orden de las secciones = orden de las paradas de la escena 3D. */
export const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "anatomia", label: "Anatomía" },
  { id: "espresso", label: "Espresso" },
  { id: "origen", label: "Origen" },
  { id: "visitanos", label: "Visítanos" },
] as const;

export const NAV_LINKS = [
  { href: "#anatomia", label: "Nuestro café" },
  { href: "#origen", label: "Origen" },
  { href: "#visitanos", label: "Visítanos" },
] as const;

export const HERO = {
  eyebrow: "Café de especialidad · Tostado en casa",
  title: "Tu café de siempre, hecho con calma.",
  body: "Granos de origen, tueste lento y manos que saben esperar. Desliza y mira qué hay dentro de cada taza.",
  primary: { href: "#visitanos", label: "Reserva tu mesa" },
  secondary: { href: "#anatomia", label: "Descubre el café" },
  scrollHint: "Desliza",
} as const;

export const ANATOMY = {
  eyebrow: "01 — Anatomía de una taza",
  title: "Cada parte cuenta.",
  body: "Separamos la taza para que veas lo que normalmente no se ve: nada está ahí por casualidad.",
} as const;

export const ESPRESSO = {
  eyebrow: "02 — El corazón",
  title: "Crema dorada, cuerpo intenso.",
  body: "Ajustamos cada extracción a mano, varias veces al día, para que tu espresso sepa igual a las 8 que a las 6.",
  stats: [
    { value: "9", unit: "bar", label: "Presión constante" },
    { value: "93", unit: "°C", label: "Temperatura del agua" },
    { value: "28", unit: "s", label: "Tiempo de extracción" },
  ],
} as const;

export const ORIGIN = {
  eyebrow: "03 — Origen",
  title: "Del cafetal a tu mesa.",
  body: "Compramos directo a pequeños productores y tostamos en casa cada semana. Así sabemos de dónde viene cada grano que muelen tus manos.",
  origins: ["Huila, Colombia", "Cajamarca, Perú", "Sidama, Etiopía"],
  note: "Tueste medio · Notas a cacao, panela y frutos rojos",
} as const;

export const VISIT = {
  eyebrow: "04 — Visítanos",
  title: "Te guardamos una mesa.",
  body: "Ven con prisa o sin ella. El café siempre está listo.",
  hours: [
    { days: "Lunes a viernes", time: "7:00 – 20:00" },
    { days: "Sábado y domingo", time: "8:00 – 21:00" },
  ],
  address: "Calle del Tueste 12, Centro",
  primary: { href: "#visitanos", label: "Reservar mesa" },
  secondary: { href: "#visitanos", label: "Cómo llegar" },
} as const;
