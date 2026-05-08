# 📚 Bookmark Manager (Utility Script)

Herramienta de línea de comandos tipo **utility script** para gestionar bookmarks en formato HTML (Netscape) y JSON. Está diseñada para uso puntual, permitiendo cargar, buscar, filtrar y exportar bookmarks de forma programática.

---

## 🚀 Características

- 📥 Cargar bookmarks desde archivo HTML (Netscape) o JSON
- 🔍 Buscar por palabras clave con modo OR, AND y exclusión
- 🗂️ Soporte de carpetas anidadas
- 🔄 Ordenar marcadores por frecuencia de dominio dentro de cada carpeta
- 💾 Exportar subconjuntos a HTML o JSON

## 🧱 Stack

- **Runtime:** Bun
- **Lenguaje:** TypeScript

## 🧠 Enfoque

Utility script de vida corta. El comportamiento se modifica editando directamente `index.ts`. No hay CLI compleja ni parsing de argumentos.

La lógica vive en servicios desacoplados para mantener el código legible durante su período de uso:

| Componente                  | Responsabilidad                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `BookmarkManagerFacade`     | Composition root: instancia dependencias e inyecta el parser correcto según el tipo de archivo. |
| `index.ts`                  | Orquestador del flujo: define qué operaciones se ejecutan y en qué orden.                       |
| `BookmarkManager`           | Operaciones CRUD y persistencia.                                                                |
| `BookmarkService`           | Almacén en memoria, búsqueda y transformaciones.                                                |
| `HtmlParser` / `JsonParser` | Parseo y serialización por formato.                                                             |
| `FileHandler`               | Lectura y escritura de archivos.                                                                |

## 📁 Estructura del proyecto

```
src/
├── facade/
│   └── BookmarkManagerFacade.ts
├── managers/
│   └── BookmarkManager.ts
├── services/
│   └── BookmarkService.ts
├── parsers/
│   ├── HtmlParser.ts
│   └── JsonParser.ts
├── utils/
│   └── FileHandler.ts
└── types/
    └── bookmark.ts
index.ts
data/
```

## ⚙️ Instalación

```bash
bun install
```

## ▶️ Uso

```bash
bun run start
```

Modificar el flujo directamente en `index.ts`.

## ⚡ Notas

Este proyecto prioriza simplicidad y velocidad de implementación. No está diseñado para extensión a largo plazo.
