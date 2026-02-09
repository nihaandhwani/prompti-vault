import Link from "next/link";
import { getMyArticles } from "@/actions/articles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ArticleActions from "@/components/article-actions";

export default async function MyArticlesPage() {
  const { data: articles, error } = await getMyArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Articles</h1>
        <Button asChild>
          <Link href="/new-article">New Article</Link>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!articles || articles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You have no articles yet. Create your first one!
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 pr-4 font-medium">Updated</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {article.title}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {(article.categories as { name: string; slug: string })?.name ?? "Uncategorized"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            article.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            article.status === "published"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }
                        >
                          {article.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <ArticleActions
                          articleId={article.id}
                          currentStatus={article.status as "draft" | "published"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
