import type { Bookmark, BookmarkSchema } from '@/types/bookmark';
import { randomUUIDv7 } from 'bun';

export class BookmarkService {
  private bookmarks = new Map<string, Bookmark>();
  private urlIndex = new Map<string, string>();

  private create(bookmark: BookmarkSchema): Bookmark | null {
    if (this.urlExists(bookmark.url)) return null;

    const newBookmark: Bookmark = {
      id: randomUUIDv7(),
      ...bookmark,
    };
    this.addToIndexes(newBookmark);

    return newBookmark;
  }

  public createMany(bookmarks: BookmarkSchema[]): number {
    let created = 0;

    for (const bookmark of bookmarks) {
      if (this.create(bookmark) !== null) created++;
    }

    return created;
  }

  public getAll(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  private addToIndexes(bookmark: Bookmark): void {
    this.bookmarks.set(bookmark.id, bookmark);
    this.urlIndex.set(bookmark.url, bookmark.id);
  }

  private urlExists(url: string): boolean {
    return this.urlIndex.has(url);
  }
}
