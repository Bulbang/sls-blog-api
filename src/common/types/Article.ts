export type Article = {
  id: string;
  lastUpdate: number,
  created: number,
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string;
};

export type ArticleReqBody = Omit<Article, 'id' | 'lastUpdate' | 'created' | 'slug'>;
