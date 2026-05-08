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
   * Updates multiple bookmarks by their ID.
   * Skips bookmarks whose ID does not exist or whose new URL conflicts with an existing one.
   *
   * @param bookmarks - Array of partial bookmark data with required `id` field
   * @returns The number of bookmarks that were successfully updated
   */
  public updateBookmarks(bookmarks: BookmarkUpdate[]): number {
    const updated = this.service.updateMany(bookmarks);
    return updated;
  }

  /**
   * Saves the bookmarks to the file system.
   *
   * @throws If the file cannot be written
   */
  public async saveBookmarks(): Promise<void> {
    try {
      const bookmarks = this.service.getAll();
      const content = this.parser.serialize(bookmarks);
      await this.fileHandler.write(this.path, content);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${this.path}`);
    } catch (error) {
      this.logger.error('Failed to save bookmarks', error);
      throw new Error(`Failed to save bookmarks to ${this.path}: ${error}`);
    }
  }
}
