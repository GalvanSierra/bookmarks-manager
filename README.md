# 📚 Bookmark Manager (Utility Script)

Herramienta de línea de comandos tipo **utility script** para gestionar bookmarks en formato HTML (Netscape) y JSON. Está diseñada para uso puntual, permitiendo cargar, buscar, filtrar y exportar bookmarks de forma programática.

---

## 🚀 Características

- 📥 Cargar bookmarks desde archivo HTML o JSON
- 🔍 Buscar bookmarks por palabras clave
- 🗂️ Soporte de carpetas anidadas
- 💾 Exportar subconjuntos de bookmarks a archivos HTML o JSON

---

## 🧱 Stack

- **Runtime:** Bun
- **Lenguaje:** TypeScript

---

## 🧠 Enfoque

Este proyecto es un **utility script**, lo que implica:

- El flujo se define directamente en el `main`
- No hay CLI compleja ni parsing de argumentos
- El comportamiento se modifica editando código
- Está pensado para uso temporal / ad-hoc

El `main` actúa como **orquestador**, mientras que la lógica vive en servicios desacoplados.

---

## 📁 Estructura del proyecto

```
src/
├── managers/
│   └── BookmarkManager.ts
├── services/
│   └── BookmarkService.ts
├── parsers/
│   └── HtmlParser.ts
│   └── JsonParser.ts
├── utils/
│   └── FileHandler.ts
│   └── Logger.ts
├── types/
│   └── bookmark.ts
└── facade/
    └── BookmarkManagerFacade.ts

data/
```

---

## ⚙️ Instalación

```bash
bun install
```

To run:

```bash
bun run start
```

## ⚡ Notas

Este proyecto prioriza:

- Simplicidad
- Velocidad de implementación
- Control directo del flujo
