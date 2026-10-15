# DAIS QUIZZ 🧠

Mini juego de cultura general hecho para Dais: 43 preguntas de dificultad progresiva + 1 pregunta bonus final.

- Dos modalidades: **con tiempo** (20 s por pregunta, cuenta regresiva y barra animada) o **sin tiempo**.
- 100 puntos por acierto y 200 por la pregunta bonus (máximo 4500).
- Explicación breve tras cada respuesta, revisión completa al final y récord guardado en `localStorage`.
- Atajos de teclado: `A` / `B` / `C` o `1` / `2` / `3` para responder; `Enter` para avanzar.
- Sonidos opcionales (Web Audio, sin archivos externos), confeti para buenos resultados y botón para copiar el resumen.
- Respeta `prefers-reduced-motion`, con foco visible y navegación por teclado.

## Uso

```bash
npm install
npm run dev     # servidor de desarrollo
npm run build   # build de producción en dist/
npm run preview # sirve el build localmente
```

Requiere Node.js 20.19 o superior.

## Editar preguntas

Las preguntas viven en [`src/data/questions.js`](src/data/questions.js). Cada una tiene un `id` estable, una categoría, tres opciones, el índice de la respuesta correcta (`answer`) y una explicación.

## Despliegue en Vercel

Importa el repositorio en Vercel: detecta Vite automáticamente (build `npm run build`, salida `dist`). No necesita variables de entorno.

## Stack

React + Vite, CSS propio y la fuente Fredoka empaquetada localmente con `@fontsource`. Sin backend.
