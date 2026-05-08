import { BookmarkManager } from '@/managers/BookmarkManager';
import { HtmlParser } from '@/parsers/HtmlParser';
import { JsonParser } from '@/parsers/JsonParser';
import { BookmarkService } from '@/services/BookmarkService';
import type { IParserBookmark } from '@/types/interfaces';
import { FileHandler } from '@/utils/FileHandler';
import { Logger } from '@/utils/Logger';
import { extname } from 'node:path';

/** Map of file extensions to their corresponding parser instances. */
const parsers: Record<string, IParserBookmark> = {
  '.html': new HtmlParser(),
  '.json': new JsonParser(),
};

export class BookmarkManagerFacade {
  /**
   * Loads bookmarks from the given file path.
   *
   * The file extension (`.html` or `.json`) determines which parser is used.
   *
   * @param path - Path to the bookmark file
   * @returns A fully initialized `BookmarkManager` with bookmarks already loaded
   * @throws If the file extension is not supported (`.html` or `.json`)
   */
  async load(path: string): Promise<BookmarkManager> {
    const extension = extname(path);

    if (!parsers[extension]) throw new Error(`Unsupported file extension: ${extension}`);

    const parser = parsers[extension];

    const logger = new Logger();
    const fileHandler = new FileHandler(logger);
    const service = new BookmarkService();
    const manager = new BookmarkManager(path, fileHandler, parser, service, logger);

    await manager.loadBookmarks();

    return manager;
  }
}
