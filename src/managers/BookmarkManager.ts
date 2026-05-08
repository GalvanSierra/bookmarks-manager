import type { BookmarkService } from '@/services/BookmarkService';
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
