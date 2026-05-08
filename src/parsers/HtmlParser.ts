import { HTML_TEMPLATE } from '@/config/constans';
import type { Bookmark, BookmarkSchema } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';

/** Represents a node in a nested folder tree of bookmarks. */
export interface FolderNode {
  /** The display name of the folder */
  name: string;
  /** Direct bookmarks contained in this folder */
  bookmarks: Bookmark[];
  /** Child folders keyed by their name */
  children: Map<string, FolderNode>;
  /** Reference to the parent folder node, if any */
  parent?: FolderNode;
}

/**
 * Parses bookmark data from an HTML bookmark export file
 * (standard Netscape bookmark format).
 */
export class HtmlParser implements IParserBookmark {
  /**
   * Parses an HTML string containing bookmarks into an array of `BookmarkSchema` objects.
   *
   * The parser walks line-by-line, tracking folder depth via `<H3>` and `</DL>` tags,
   * and extracts bookmark details from `<A>` elements.
   *
   * @param content - Raw HTML string in Netscape bookmark format
   * @returns An array of parsed bookmarks with folder paths built from the nesting hierarchy
   */
  public parse(content: string): BookmarkSchema[] {
    const bookmarks: BookmarkSchema[] = [];

    const lines = content.split('\n');
    const folderStack: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();

      if (!line) continue;

      const folderMatch = line.match(/<H3[^>]*>([^<]+)<\/H3>/i);
      if (folderMatch) {
        const folderName = folderMatch[1]?.trim();

        if (folderName === 'Marcadores') continue;

        folderStack.push(folderName || '');
        continue;
      }

      if (line.includes('</DL>')) {
        if (folderStack.length > 0) {
          folderStack.pop();
        }
        continue;
      }

      const bookmarkMatch = line.match(/<A\s+([^>]+)>([^<]+)<\/A>/i);
      if (bookmarkMatch) {
        let [, attributes, title] = bookmarkMatch;

        const hrefMatch = attributes?.match(/HREF="([^"]+)"/i);
        if (!hrefMatch) continue;

        let url = hrefMatch[1]?.trim();

        const iconMatch = attributes?.match(/ICON="([^"]+)"/i);
        const icon = iconMatch ? iconMatch[1]?.trim() : undefined;

        const folder = folderStack.length > 0 ? folderStack.join(' > ') : 'Marcadores';

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

  /**
   * Serializes an array of bookmarks into an HTML bookmark file string
   * (standard Netscape bookmark format).
   *
   * @param bookmarks - The bookmarks to serialize
   * @returns HTML string representing the bookmark file
   */
  public serialize(bookmarks: Bookmark[]): string {
    let html = HTML_TEMPLATE;
    // Construir el árbol de carpetas
    const folderTree = this.buildFolderTree(bookmarks);

    // Renderizar el árbol completo
    html += this.renderFolderTreeToHtml(folderTree, 2);

    // Cerrar estructura
    html += `    </DL><p>
</DL><p>
`;

    return html;
  }

  /**
   * Builds a nested folder tree from a flat list of bookmarks.
   *
   * @param bookmarks - The bookmarks to organize into the tree
   * @returns The root `FolderNode` of the constructed tree
   */
  private buildFolderTree(bookmarks: Bookmark[]): FolderNode {
    const root: FolderNode = {
      name: 'Marcadores',
      bookmarks: [],
      children: new Map(),
    };

    bookmarks.forEach((bookmark) => {
      const folderPath = bookmark.folder || 'Marcadores';

      if (folderPath === 'Marcadores') {
        root.bookmarks.push(bookmark);
        return;
      }

      const parts = folderPath.split(' > ');
      let currentNode = root;

      // Navegar/crear la estructura de carpetas
      for (const part of parts) {
        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            name: part,
            bookmarks: [],
            children: new Map(),
            parent: currentNode,
          });
        }
        // biome-ignore lint/style/noNonNullAssertion: <>
        currentNode = currentNode.children.get(part)!;
      }

      // Agregar el bookmark al nodo final
      currentNode.bookmarks.push(bookmark);
    });

    return root;
  }

  /**
   * Recursively renders a folder tree node (and its children) to HTML.
   *
   * @param node        - The folder node to render
   * @param indentLevel - The current indentation depth for pretty-printing
   * @returns HTML string fragment for this node and its descendants
   */
  private renderFolderTreeToHtml(node: FolderNode, indentLevel: number): string {
    const indent = '    '.repeat(indentLevel);
    let html = '';

    // Renderizar bookmarks del nodo actual
    node.bookmarks.forEach((bookmark) => {
      html += this.formatBookmarkHtml(bookmark, indentLevel);
    });

    // Renderizar carpetas hijas
    const sortedChildren = Array.from(node.children.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    sortedChildren.forEach(([folderName, childNode]) => {
      // Abrir carpeta
      html += `${indent}<DT><H3>${folderName}</H3>\n`;
      html += `${indent}<DL><p>\n`;

      // Renderizar contenido de la carpeta recursivamente
      html += this.renderFolderTreeToHtml(childNode, indentLevel + 1);

      // Cerrar carpeta
      html += `${indent}</DL><p>\n`;
    });

    return html;
  }

  /**
   * Formats a single bookmark as an HTML `<A>` element line.
   *
   * @param bookmark    - The bookmark to format
   * @param indentLevel - The indentation depth for pretty-printing
   * @returns HTML string for the bookmark entry
   */
  private formatBookmarkHtml(bookmark: Bookmark, indentLevel: number): string {
    const indent = '    '.repeat(indentLevel);
    let attributes = `HREF="${bookmark.url}"`;

    // Agregar ícono si existe
    if (bookmark.icon) {
      attributes += ` ICON="${bookmark.icon}"`;
    }

    // Agregar fecha de adición si existe
    if (bookmark.dateAdded) {
      const timestamp = bookmark.dateAdded;
      attributes += ` ADD_DATE="${timestamp}"`;
    }

    return `${indent}<DT><A ${attributes}>${bookmark.title}</A>\n`;
  }
}
