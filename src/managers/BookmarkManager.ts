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
}
