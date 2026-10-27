# Calma Café — Landing 3D

Landing de cafetería con una escena 3D que reacciona al scroll: la taza, el café y el platillo se separan, giran y se vuelven a armar mientras bajas por la página.

**Stack:** Next.js 16 (App Router) · TypeScript · CSS Modules · three.js + React Three Fiber · Lenis (scroll suave)

```bash
npm install
npm run dev   # http://localhost:3000
```

## Estructura

```
src/
├─ app/                     layout (fuentes, metadata) y página
├─ styles/tokens.css        design system: colores, tipografía, espaciado, radios (claro/oscuro)
├─ content/landing.ts       todos los textos de la landing
├─ lib/                     utilidades sin UI (progreso de scroll, keyframes, random, motion)
└─ components/
   ├─ ui/                   piezas del design system (Button, Reveal)
   ├─ layout/               Navbar, Footer, SmoothScroll
   ├─ landing/              secciones (Hero, Anatomy, Espresso, Origin, Visit) + SceneSection
   └─ three/                escena 3D
      ├─ CoffeeScene.tsx      Canvas, luces, etiquetas
      ├─ CoffeeAssembly.tsx   aplica la coreografía cada frame
      ├─ choreography.ts      ← poses por sección (edita aquí la animación)
      ├─ geometry.ts          modelos procedurales (taza, platillo, café, grano)
      └─ parts/               Cup, Saucer, Coffee, Splash, Beans, Steam
```

## Cómo funciona la animación

1. Cada `<section data-scene-section>` es una **parada**. `lib/scene-progress.ts` convierte el scroll en un número continuo: `0` = Hero, `1` = Anatomía, `2.5` = a mitad entre Espresso y Origen…
2. `three/choreography.ts` define una pose (posición, rotación, escala) por parada para el conjunto y para cada pieza.
3. Cada frame se interpola entre poses con una curva suave. Añadir una sección = añadir un `SceneSection` y una pose más en cada pista.

## Render realista

- **Entorno:** HDRI de estudio real `public/hdri/studio_small_09_1k.hdr` ([Poly Haven](https://polyhaven.com/a/studio_small_09), CC0) + un softbox frontal para el brillo vertical de la cerámica.
- **Sombras:** luz de ventana con sombras suaves (PCSS) y sombra de contacto bajo el platillo.
- **Oclusión ambiental horneada** (`three/ambientOcclusion.ts`): al cargar se lanzan rayos con `three-mesh-bvh` y el resultado se guarda en el color de vértice. No cuesta nada por frame.
- **Materiales:** esmalte con clearcoat, café líquido brillante, crema mate con relieve y texturas generadas en canvas.

Los modelos son procedurales (sin `.glb`), así que la escena pesa unos KB (más el HDRI de 1,6 MB). Se respeta `prefers-reduced-motion` (sin scroll suave ni movimiento idle).
