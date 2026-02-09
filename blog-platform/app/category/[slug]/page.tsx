import Link from "next/link";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getLikeInfo } from "@/actions/likes";
import ArticleCard from "@/components/article-card";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

interface ArticleWithJoins {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  profiles: { full_name: string };
  categories: { name: string; slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [{ data: articles }, { data: categories }] = await Promise.all([
    getPublishedArticles(slug),
    getCategories(),
  ]);

  const category = categories?.find((c) => c.slug === slug);
  const categoryName = category?.name ?? slug;

  const articlesWithLikes = await Promise.all(
    (articles ?? []).map(async (article) => {
      const likeInfo = await getLikeInfo(article.id, "");
      return { article: article as unknown as ArticleWithJoins, likeInfo };
    })
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">{categoryName}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
      </div>

      {articlesWithLikes.length > 0 ? (
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
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No articles in this category yet.
        </p>
      )}
    </div>
  );
}
