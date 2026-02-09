import Link from "next/link";
import { getArticleBySlug, getRelatedArticles } from "@/actions/articles";
import { getLikeInfo } from "@/actions/likes";
import { formatDate } from "@/lib/utils";
import ArticleCard from "@/components/article-card";
import ArticleLikeWrapper from "@/components/article-like-wrapper";

interface ArticleWithJoins {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  category_id: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string };
  profiles?: { full_name: string };
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { data } = await getArticleBySlug(slug);
  const article = data as ArticleWithJoins | null;

  if (!article) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <p className="mt-2 text-muted-foreground">
          The article you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-primary underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const [likeInfo, { data: relatedArticles }] = await Promise.all([
    getLikeInfo(article.id, ""),
    getRelatedArticles(article.category_id, article.id),
  ]);

  const relatedWithLikes = await Promise.all(
    (relatedArticles ?? []).map(async (ra) => {
      const info = await getLikeInfo(ra.id, "");
      return { article: ra as ArticleWithJoins, likeInfo: info };
    })
  );

  return (
    <article className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/category/${article.categories?.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {article.categories?.name ?? "Uncategorized"}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">
          {article.title}
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            By {article.profiles?.full_name ?? "Unknown"}
          </span>
          {article.published_at && (
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          )}
          <ArticleLikeWrapper
            articleId={article.id}
            initialLikeCount={likeInfo.count}
            initialIsLiked={likeInfo.isLiked}
          />
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Related Articles */}
      {relatedWithLikes.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-2xl font-semibold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedWithLikes.map(({ article: ra, likeInfo: info }) => (
              <ArticleCard
                key={ra.id}
                article={ra as ArticleWithJoins & { profiles: { full_name: string }; categories: { name: string; slug: string } }}
                likeCount={info.count}
                isLiked={info.isLiked}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
