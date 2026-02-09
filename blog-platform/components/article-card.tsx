import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExcerpt, formatDate } from "@/lib/utils";
import LikeButton from "@/components/like-button";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    published_at: string | null;
    profiles: {
      full_name: string;
    };
    categories: {
      name: string;
      slug: string;
    };
  };
  likeCount: number;
  isLiked: boolean;
}

export default function ArticleCard({
  article,
  likeCount,
  isLiked,
}: ArticleCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">
            {article.categories?.name ?? "Uncategorized"}
          </Badge>
          {article.published_at && (
            <span className="text-xs text-muted-foreground">
              {formatDate(article.published_at)}
            </span>
          )}
        </div>
        <Link
          href={`/article/${article.slug}`}
          className="hover:underline"
        >
          <h2 className="text-xl font-semibold leading-tight line-clamp-2">
            {article.title}
          </h2>
        </Link>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {getExcerpt(article.content)}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          By {article.profiles?.full_name ?? "Unknown"}
        </span>
        <LikeButton
          articleId={article.id}
          initialLikeCount={likeCount}
          initialIsLiked={isLiked}
        />
      </CardFooter>
    </Card>
  );
}
