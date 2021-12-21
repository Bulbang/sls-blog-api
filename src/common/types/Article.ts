export type Article = {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string;
  created_at: number;
  updated_at: number;
  // file_name: string,
  mime_type: string;
};

export type Response = {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string;
  created_at: number;
  updated_at: number;
  mime_type: string;
  url: string;
  file_name:string
};

export type ArticleType = () => Article;

export type ArticleReqBody = Omit<
  Article,
  "id" | "lastUpdate" | "created" | "slug" | "created_at" | "updated_at"
>;

export type TrimmedArticle = Omit<
  Article,
  "meta_title" | "meta_description" | "content" | "created_at" | "updated_at"
>;
