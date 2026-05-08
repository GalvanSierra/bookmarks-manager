export interface BookmarkSchema {
  title: string;
  url: string;
  folder: string;
  dateAdded?: string;
  icon?: string;
}

export type Bookmark = BookmarkSchema & {
  id: string;
};

export type BookmarkUpdate = Partial<Bookmark> & { id: string };

export type SearchFile = 'title' | 'url' | 'folder';

export interface SearchOptions {
  includeWords: string[];
  ignoreWords?: string[];
  caseSensitive?: boolean;
  searchIn?: SearchFile[];
  includeAllWords?: boolean;
}
