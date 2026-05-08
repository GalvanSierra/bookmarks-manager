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
  parse(content: string): BookmarkSchema[] {
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
}
