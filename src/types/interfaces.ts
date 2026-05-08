import type { Bookmark, BookmarkSchema } from '@/types/bookmark';

export interface IParserBookmark {
  parse(content: string): BookmarkSchema[];
  serialize(bookmarks: Bookmark[]): string;
}
