import { Suspense } from "react";
import { searchArticles } from "@/actions/articles";
import { getLikeInfo } from "@/actions/likes";
import SearchBar from "@/components/search-bar";
import ArticleCard from "@/components/article-card";

interface ArticleWithJoins {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  profiles: { full_name: string };
  categories: { name: string; slug: string };
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let articles: ArticleWithJoins[] = [];
  if (query) {
    const { data } = await searchArticles(query);
    articles = (data ?? []) as unknown as ArticleWithJoins[];
  }

  const articlesWithLikes = await Promise.all(
    articles.map(async (article) => {
      const likeInfo = await getLikeInfo(article.id, "");
      return { article, likeInfo };
    })
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
      </div>

      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      {!query ? (
        <p className="py-12 text-center text-muted-foreground">
          Enter a search term to find articles.
        </p>
      ) : articlesWithLikes.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {articlesWithLikes.length} result{articlesWithLikes.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articlesWithLikes.map(({ article, likeInfo }) => (
              <ArticleCard
                key={article.id}
                article={article}
                likeCount={likeInfo.count}
                isLiked={likeInfo.isLiked}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  );
}
