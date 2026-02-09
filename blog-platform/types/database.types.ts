export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "author";
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  category_id: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleLike = {
  id: string;
  article_id: string;
  fingerprint: string;
  created_at: string;
};

export type ArticleWithDetails = Article & {
  profiles: { full_name: string };
  categories: { name: string; slug: string };
  like_count: number;
};

export type CategoryWithCount = Category & {
  article_count: number;
};
