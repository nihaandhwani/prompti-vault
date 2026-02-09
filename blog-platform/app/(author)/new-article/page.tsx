"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/actions/articles";
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

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const result = await getCategories();
      if (result.data) {
        setCategories(result.data);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (status: "draft" | "published") => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("category_id", categoryId);
    formData.set("status", status);

    const result = await createArticle(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/my-articles");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Article</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Article</CardTitle>
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
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              Publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
