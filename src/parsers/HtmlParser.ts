import type { Bookmark, BookmarkSchema } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';

export interface FolderNode {
  name: string;
  bookmarks: Bookmark[];
  children: Map<string, FolderNode>;
  parent?: FolderNode;
}

export class HtmlParser implements IParserBookmark {
  parse(content: string): BookmarkSchema[] {
    const bookmarks: BookmarkSchema[] = [];

    const lines = content.split('\n');
    const folderStack: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();

      if (!line) continue;

      // Detectar carpetas
      const folderMatch = line.match(/<H3[^>]*>([^<]+)<\/H3>/i);
      if (folderMatch) {
        const folderName = folderMatch[1]?.trim();

        // Ignorar la carpeta "Marcadores" ya que es solo el contenedor principal
        if (folderName === 'Marcadores') continue;

        folderStack.push(folderName || '');
        continue;
      }

      // Detectar fin de carpeta
      if (line.includes('</DL>')) {
        if (folderStack.length > 0) {
          folderStack.pop();
        }
        continue;
      }

      // Detectar bookmarks - patrón más flexible para capturar todos los atributos
      const bookmarkMatch = line.match(/<A\s+([^>]+)>([^<]+)<\/A>/i);
      if (bookmarkMatch) {
        let [, attributes, title] = bookmarkMatch;

        // Extraer URL
        const hrefMatch = attributes?.match(/HREF="([^"]+)"/i);
        if (!hrefMatch) continue;

        let url = hrefMatch[1]?.trim();

        // Extraer ícono
        const iconMatch = attributes?.match(/ICON="([^"]+)"/i);
        const icon = iconMatch ? iconMatch[1]?.trim() : undefined;

        // Construir la ruta de la carpeta
        const folder = folderStack.length > 0 ? folderStack.join(' > ') : 'Marcadores';

        // Extraer fecha de adición si existe
        const addDateMatch = attributes?.match(/ADD_DATE="([^"]+)"/i);
        const dateAdded: string = addDateMatch ? addDateMatch[1]?.trim() || '' : '';

        if (!title) title = '';
        if (!url) continue;

        url = new URL(url).href;

        bookmarks.push({
          title: title.trim(),
          url,
          folder,
          icon,
          dateAdded,
        });
      }
    }

    return bookmarks;
  }
}
