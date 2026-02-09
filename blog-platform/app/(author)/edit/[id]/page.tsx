"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArticleById, updateArticle } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import type { Category } from "@/types/database.types";
import TiptapEditor from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [articleResult, categoriesResult] = await Promise.all([
        getArticleById(params.id),
        getCategories(),
      ]);

      if (articleResult.error || !articleResult.data) {
        setError(articleResult.error ?? "Article not found");
        setFetching(false);
        return;
      }

      const article = articleResult.data;
      setTitle(article.title);
      setCategoryId(article.category_id);
      setContent(article.content);
      setStatus(article.status as "draft" | "published");

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      setFetching(false);
    }

    fetchData();
  }, [params.id]);

  const handleSubmit = async (newStatus: "draft" | "published") => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("category_id", categoryId);
    formData.set("status", newStatus);

    const result = await updateArticle(params.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/my-articles");
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Article</h1>

      <Card>
        <CardHeader>
          <CardTitle>Update Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              {status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
