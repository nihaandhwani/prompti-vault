import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [usersResult, categoriesResult, articlesResult, publishedResult, draftResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("categories")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
    ]);

  const stats = [
    {
      title: "Total Users",
      value: usersResult.count ?? 0,
    },
    {
      title: "Total Categories",
      value: categoriesResult.count ?? 0,
    },
    {
      title: "Total Articles",
      value: articlesResult.count ?? 0,
    },
    {
      title: "Published Articles",
      value: publishedResult.count ?? 0,
    },
    {
      title: "Draft Articles",
      value: draftResult.count ?? 0,
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
