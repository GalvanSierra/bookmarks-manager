import type { Bookmark, BookmarkSchema, BookmarkUpdate, SearchOptions } from '@/types/bookmark';
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
   * Searches bookmarks by keywords and returns a filtered array.
   *
   * @param options - Search options
   * @returns An array of `Bookmark` objects that match the search criteria
   */
  public searchBy(options: SearchOptions): Bookmark[] {
    let { includeWords } = options;
    const {
      ignoreWords = [],
      caseSensitive = false,
      searchIn = ['title', 'url'],
      includeAllWords = false,
    } = options;

    return Array.from(this.bookmarks.values()).filter((bookmark) => {
      const searchTexts: string[] = [];

      if (searchIn.includes('title')) searchTexts.push(bookmark.title);
      if (searchIn.includes('url')) searchTexts.push(bookmark.url);
      if (searchIn.includes('folder') && bookmark.folder) searchTexts.push(bookmark.folder);

      const searchText = searchTexts.join(' ');

      return this.matchWithKeywords(
        searchText,
        includeWords,
        ignoreWords,
        caseSensitive,
        includeAllWords,
      );
    });
  }

  /**
   * Updates multiple bookmarks by their ID.
   * Skips bookmarks whose ID does not exist or whose new URL conflicts with an existing one.
   *
   * @param bookmarks - Array of partial bookmark data with required `id` field
   * @returns The number of bookmarks that were successfully updated
   */
  public updateMany(bookmarks: BookmarkUpdate[]): number {
    let updated = 0;
    for (const bookmark of bookmarks) {
      if (!this.bookmarks.has(bookmark.id)) continue;
      const existing = this.bookmarks.get(bookmark.id)!;

      const updatedBookmark: Bookmark = {
        ...existing,
        ...bookmark,
      };

      const existingId = this.urlIndex.get(updatedBookmark.url);
      if (existingId !== bookmark.id) continue;

      this.bookmarks.set(bookmark.id, updatedBookmark);

      if (existing.url !== updatedBookmark.url) {
        this.urlIndex.delete(existing.url);
        this.urlIndex.set(updatedBookmark.url, updatedBookmark.id);
      }

      updated++;
    }

    return updated;
  }

  /**
   * Deletes multiple bookmarks by their ID.
   *
   * @param bookmarks - Array of bookmark data with required `id` field
   * @returns The number of bookmarks that were successfully deleted
   */

  public deleteMany(bookmarks: BookmarkUpdate[]): number {
    let deleted = 0;
    for (const bookmark of bookmarks) {
      if (!this.bookmarks.has(bookmark.id)) continue;

      const existing = this.bookmarks.get(bookmark.id)!;

      this.bookmarks.delete(bookmark.id);
      this.urlIndex.delete(existing.url);

      deleted++;
    }

    return deleted;
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

  /**
   * Checks whether a search text matches a set of include and exclude words.
   *
   * @param searchText - The text to search for
   * @param includeWords - An array of words to include in the search
   * @param ignoreWords - An array of words to exclude from the search
   * @param caseSensitive - Whether to perform a case-sensitive search
   * @param includeAllWords - Whether to require all include words to match
   * @returns `true` if the search text matches the include and exclude words
   */
  private matchWithKeywords(
    searchText: string,
    includeWords: string[],
    ignoreWords: string[],
    caseSensitive: boolean,
    includeAllWords: boolean,
  ): boolean {
    const prepareText = (text: string) => (caseSensitive ? text : text.toLowerCase());

    const searchTextPrep = prepareText(searchText);
    const includeWordsPrep = includeWords.map(prepareText);
    const excludeWordsPrep = ignoreWords.map(prepareText);

    const hasIncludeWord = includeAllWords
      ? includeWordsPrep.every((word) => searchTextPrep.includes(word)) // AND lógico
      : includeWordsPrep.some((word) => searchTextPrep.includes(word)); // OR lógico

    const hasExcludeWord = excludeWordsPrep.some((word) => searchTextPrep.includes(word));

    return hasIncludeWord && !hasExcludeWord;
  }
}
