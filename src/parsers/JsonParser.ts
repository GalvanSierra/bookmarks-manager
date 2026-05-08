import type { Bookmark, BookmarkSchema } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';

/**
 * Parses bookmark data from a JSON string.
 * Expects an array of objects with `title`, `url`, `folder`, `dateAdded`, and `icon` properties.
 */
export class JsonParser implements IParserBookmark {
  /**
   * Parses a JSON string into an array of `BookmarkSchema` objects.
   *
   * @param content - Raw JSON string containing bookmark data
   * @returns An array of parsed bookmarks; returns an empty array if the input is not an array
   */
  parse(content: string): BookmarkSchema[] {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      const url = new URL(item.url).href;

      return {
        title: item.title || '',
        url: url || '',
        folder: item.folder || 'Marcadores',
        dateAdded: item.dateAdded || '',
        icon: item.icon,
      };
    });
  }

  /**
   * Serializes an array of `Bookmark` objects into a JSON string.
   *
   * @param bookmarks - Array of `Bookmark` objects to serialize
   * @returns A JSON string representation of the input array
   */
  serialize(bookmarks: Bookmark[]): string {
    return JSON.stringify(bookmarks);
  }
}
