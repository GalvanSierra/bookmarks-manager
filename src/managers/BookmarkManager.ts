import type { BookmarkService } from '@/services/BookmarkService';
import type { Bookmark, BookmarkUpdate, SearchOptions } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';
import type { FileHandler } from '@/utils/FileHandler';
import type { Logger } from '@/utils/Logger';

export class BookmarkManager {
  constructor(
    private path: string,
    private fileHandler: FileHandler,
    private parser: IParserBookmark,
    private service: BookmarkService,
    private logger: Logger,
  ) {}

  /**
   * Adds multiple bookmarks to the service.
   *
   * @param bookmark - Array of bookmark data to add
   * @returns The number of bookmarks that were successfully created
   */
  public addBookmarks(bookmark: Bookmark[]): number {
    const created = this.service.createMany(bookmark);
    return created;
  }

  /**
   * Loads bookmarks from the file system.
   *
   * @throws If the file cannot be read or parsed
   */
  public async loadBookmarks(): Promise<void> {
    try {
      const content = await this.fileHandler.read(this.path);
      const bookmarks = this.parser.parse(content);

      const created = this.service.createMany(bookmarks);

      this.logger.info(
        `Loaded ${created} bookmarks (${bookmarks.length - created} duplicates) from ${this.path}`,
      );
    } catch (error) {
      this.logger.error('Failed to load bookmarks', error);
      throw new Error(`Failed to load bookmarks from ${this.path}: ${error}`);
    }
  }

  /**
   * Searches bookmarks by keywords and returns a filtered array.
   *
   * @param options - Search options
   * @returns An array of `Bookmark` objects that match the search criteria
   */
  public searchBookmarksBy(searchOptions: SearchOptions): Bookmark[] {
    const results = this.service.searchBy(searchOptions);

    if (results.length === 0) {
      this.logger.info(`Not found any bookmarks with keywords`);
      return [];
    }

    this.logger.info(
      `Found ${results.length} bookmarks with keywords: ${searchOptions.includeWords.join(', ')}`,
    );

    return results;
  }

  /**
   * Picks bookmarks by keywords and deletes them from the service.
   *
   * @param searchOptions - Search options
   * @returns An array of `Bookmark` objects that match the search criteria
   */
  public pickBookmarksBy(searchOptions: SearchOptions): Bookmark[] {
    const picked = this.searchBookmarksBy(searchOptions);
    if (picked.length === 0) return [];

    this.service.deleteMany(picked);
    this.logger.info(`Picked ${picked.length} bookmarks`);

    return picked;
  }

  /**
   * Updates multiple bookmarks by their ID.
   * Skips bookmarks whose ID does not exist or whose new URL conflicts with an existing one.
   *
   * @param bookmarks - Array of partial bookmark data with required `id` field
   * @returns The number of bookmarks that were successfully updated
   */
  public updateBookmarks(bookmarks: BookmarkUpdate[]): void {
    const updated = this.service.updateMany(bookmarks);

    this.logger.info(`Updated ${updated} bookmarks`);
  }

  /**
   * Deletes multiple bookmarks by their ID.
   *
   * @param bookmarks - Array of bookmark data with required `id` field
   * @returns The number of bookmarks that were successfully deleted
   */
  public deleteBookmarks(bookmarks: BookmarkUpdate[]): void {
    const deleted = this.service.deleteMany(bookmarks);

    this.logger.info(`Deleted ${deleted} bookmarks`);
  }

  /**
   * Returns all stored bookmarks.
   *
   * @returns An array of `Bookmark` objects
   */
  public getBookmarks(): Bookmark[] {
    return this.service.getAll();
  }
  /**
   * Saves the bookmarks to the file system. If `ordered` is `true`, the bookmarks are sorted by domain.
   *
   * @param ordered - Whether to sort the bookmarks by domain before saving
   * @throws If the file cannot be written
   */

  public async saveBookmarks(ordered?: boolean): Promise<void> {
    try {
      let bookmarks: Bookmark[];

      if (ordered) bookmarks = this.service.orderByDomain(this.service.getAll());
      else bookmarks = this.service.getAll();

      const content = this.parser.serialize(bookmarks);
      await this.fileHandler.write(this.path, content);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${this.path}`);
    } catch (error) {
      this.logger.error('Failed to save bookmarks', error);
      throw new Error(`Failed to save bookmarks to ${this.path}: ${error}`);
    }
  }
}
