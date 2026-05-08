import { BookmarkManager } from '@/managers/BookmarkManager';
import { HtmlParser } from '@/parsers/HtmlParser';
import { JsonParser } from '@/parsers/JsonParser';
import { BookmarkService } from '@/services/BookmarkService';
import type { Bookmark } from '@/types/bookmark';
import type { IParserBookmark } from '@/types/interfaces';
import { FileHandler } from '@/utils/FileHandler';
import { Logger } from '@/utils/Logger';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

/** Map of file extensions to their corresponding parser instances. */
const parsers: Record<string, IParserBookmark> = {
  '.html': new HtmlParser(),
  '.json': new JsonParser(),
};

export class BookmarkManagerFacade {
  private logger = new Logger();
  private fileHandler = new FileHandler(this.logger);
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

    const service = new BookmarkService();
    const manager = new BookmarkManager(path, this.fileHandler, parser, service, this.logger);

    await manager.loadBookmarks();

    return manager;
  }

  /**
   * Exports bookmarks to the given file path.
   *
   * The file extension (`.html` or `.json`) determines which parser is used.
   *
   * @param path - Path to the bookmark file
   * @param bookmarks - Array of bookmarks to export
   * @throws If the file extension is not supported (`.html` or `.json`)
   */
  async export(path: string, bookmarks: Bookmark[]): Promise<void> {
    const extension = extname(path);

    if (!parsers[extension]) throw new Error(`Unsupported file extension: ${extension}`);
    const parser = parsers[extension];

    const content = parser.serialize(bookmarks);

    await this.fileHandler.write(path, content);
  }

  async readDirectory(path: string): Promise<string[]> {
    const files = await readdir(path, {
      withFileTypes: true,
      recursive: true,
    });

    return files.filter((file) => file.isFile()).map((file) => join(file.parentPath, file.name));
  }
}
