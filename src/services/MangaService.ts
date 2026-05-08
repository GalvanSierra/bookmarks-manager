import { CONFIG_BY_DOMAIN } from '@/config/constans';
import type { Bookmark } from '@/types/bookmark';
import type { Manga, MangaChapter, MangaSeries } from '@/types/manga';

export class MangaService {
  /**
   * Parses bookmarks into MangaSeries, MangaChapters, and Manga.
   *
   * @param bookmarks - Array of bookmarks to parse
   * @returns An object containing MangaSeries, MangaChapters, and Manga
   */
  public parser(bookmarks: Bookmark[]): {
    series: MangaSeries[];
    chapters: MangaChapter[];
    others: Manga[];
  } {
    const byDomain = Map.groupBy(bookmarks, (manga) => this.getHostname(manga.url));

    const series: MangaSeries[] = [];
    const chapters: MangaChapter[] = [];
    const others: Manga[] = [];

    for (const [domain, domainBookmarks] of Object.entries(byDomain)) {
      const config = CONFIG_BY_DOMAIN[domain];

      if (!config) {
        others.push(...domainBookmarks);
        continue;
      }

      for (const bookmark of domainBookmarks) {
        const serieMatch = bookmark.title.match(config.regexTitle);
        if (!serieMatch?.[1]) continue;

        const chapterMatch = bookmark.title.match(config.regexChapter);

        if (chapterMatch?.[1]) {
          chapters.push({
            ...bookmark,
            serie: serieMatch[1],
            chapter: parseFloat(chapterMatch[1]),
          });
        } else {
          series.push({ ...bookmark, serie: serieMatch[1] });
        }
      }
    }

    return { series, chapters, others };
  }

  /** Picks the most recent chapter for each series
   *
   *  @param chapters - Array of MangaChapters to pick
   *  @returns An object containing the chapters to keep and delete.
   */
  pickMostRecent(chapters: MangaChapter[]): { toKeep: MangaChapter[]; toDelete: MangaChapter[] } {
    const bySerie = Map.groupBy(chapters, (m) => m.serie);
    const toKeep: MangaChapter[] = [];
    const toDelete: MangaChapter[] = [];

    for (const serieChapters of bySerie.values()) {
      const sorted = [...serieChapters].sort((a, b) => b.chapter - a.chapter);
      const [newest, ...rest] = sorted;
      toKeep.push(newest as MangaChapter);
      toDelete.push(...rest);
    }

    return { toKeep, toDelete };
  }

  private getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'invalid-url';
    }
  }
}
