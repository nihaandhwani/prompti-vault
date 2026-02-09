"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePublish, deleteArticle } from "@/actions/articles";
import { Button } from "@/components/ui/button";

interface ArticleActionsProps {
  articleId: string;
  currentStatus: "draft" | "published";
}

export default function ArticleActions({
  articleId,
  currentStatus,
}: ArticleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleTogglePublish = async () => {
    setLoading(true);
    const shouldPublish = currentStatus === "draft";
    const result = await togglePublish(articleId, shouldPublish);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article? This action cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await deleteArticle(articleId);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/edit/${articleId}`}>Edit</Link>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleTogglePublish}
        disabled={loading}
      >
        {currentStatus === "draft" ? "Publish" : "Unpublish"}
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        Delete
      </Button>
    </div>
  );
}
