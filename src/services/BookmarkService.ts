import type { Bookmark, BookmarkSchema } from '@/types/bookmark';
import { randomUUIDv7 } from 'bun';

/**
 * In-memory service for managing bookmarks.
 * Provides creation, indexing by URL (to avoid duplicates), and retrieval.
 */
export class BookmarkService {
  /** Map of bookmark ID → Bookmark */
  private bookmarks = new Map<string, Bookmark>();
  /** Map of bookmark URL → bookmark ID for O(1) duplicate checks */
  private urlIndex = new Map<string, string>();

  /**
   * Creates a single bookmark if its URL does not already exist.
   *
   * @param bookmark - The bookmark data to create
   * @returns The newly created `Bookmark` with an auto-generated ID, or `null` if the URL already exists
   */
  private create(bookmark: BookmarkSchema): Bookmark | null {
    if (this.urlExists(bookmark.url)) return null;

    const newBookmark: Bookmark = {
      id: randomUUIDv7(),
      ...bookmark,
    };
    this.addToIndexes(newBookmark);

    return newBookmark;
  }

  /**
   * Creates multiple bookmarks, skipping any whose URL already exists.
   *
   * @param bookmarks - Array of bookmark data to create
   * @returns The number of bookmarks that were successfully created
   */
  public createMany(bookmarks: BookmarkSchema[]): number {
    let created = 0;

    for (const bookmark of bookmarks) {
      if (this.create(bookmark) !== null) created++;
    }

    return created;
  }

  /**
   * Returns all stored bookmarks.
   *
   * @returns An array of all `Bookmark` objects currently in memory
   */
  public getAll(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  /**
   * Registers a bookmark in both the ID-based and URL-based indexes.
   *
   * @param bookmark - The bookmark to index
   */
  private addToIndexes(bookmark: Bookmark): void {
    this.bookmarks.set(bookmark.id, bookmark);
    this.urlIndex.set(bookmark.url, bookmark.id);
  }

  /**
   * Checks whether a URL is already indexed.
   *
   * @param url - The URL to check
   * @returns `true` if the URL already exists in the index
   */
  private urlExists(url: string): boolean {
    return this.urlIndex.has(url);
  }
}
