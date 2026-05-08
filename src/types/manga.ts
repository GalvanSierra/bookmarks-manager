import type { Bookmark } from '@/types/bookmark';

export type MangaSeries = Bookmark & { serie: string; chapter?: never };

export type MangaChapter = Bookmark & { serie: string; chapter: number };

export type Manga = MangaSeries | MangaChapter;

export type ParserConfig = { regexTitle: RegExp; regexChapter: RegExp };
