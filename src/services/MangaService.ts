import { CONFIG_BY_DOMAIN } from '@/config/constans';
import type { Bookmark } from '@/types/bookmark';
import type { MangaChapter, MangaSeries } from '@/types/manga';

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
    others: Bookmark[];
  } {
    const byDomain = Map.groupBy(bookmarks, (manga) => this.getHostname(manga.url));

    const series: MangaSeries[] = [];
    const chapters: MangaChapter[] = [];
    const others: Bookmark[] = [];

    for (const [domain, domainBookmarks] of byDomain.entries()) {
      console.log('Domain: ', domain);
      const config = CONFIG_BY_DOMAIN[domain];

      if (!config) {
        domainBookmarks.forEach((b) => others.push(b));
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

  /**
   * Removes series entries that already have at least one bookmarked chapter.
   *
   * @param series - Array of manga series bookmarks
   * @param chapters - Array of manga chapter bookmarks
   * @returns An object containing the remaining series and the removed series
   */
  removeSeriesWithChapters(
    series: MangaSeries[],
    chapters: MangaChapter[],
  ): {
    toKeep: MangaSeries[];
    toDelete: MangaSeries[];
  } {
    const toKeep: MangaSeries[] = [];
    const toDelete: MangaSeries[] = [];

    const setTitleChapters = new Set(chapters.map((s) => s.serie));

    for (const serie of series) {
      if (setTitleChapters.has(serie.serie)) {
        toDelete.push(serie);
      } else {
        toKeep.push(serie);
      }
    }

    return { toKeep, toDelete };
  }

  /** Orders chapters by chapter number.
   *
   * @param chapters - Array of MangaChapters to order
   * @param sort - Sort order ('asc' or 'desc')
   * @returns An array of MangaChapters ordered by chapter number
   */

  orderChapters(chapters: MangaChapter[], sort: 'asc' | 'desc' = 'desc'): MangaChapter[] {
    return chapters.sort((a, b) => {
      return sort === 'asc' ? b.chapter - a.chapter : a.chapter - b.chapter;
    });
  }

  /**
   * Returns the hostname of a URL.
   *
   * @param url - The URL to get the hostname of
   * @returns The hostname of the URL
   */
  private getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'invalid-url';
    }
  }
}
