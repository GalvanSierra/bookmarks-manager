import type { BookmarkSchema } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';

export class JsonParser implements IParserBookmark {
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
}
