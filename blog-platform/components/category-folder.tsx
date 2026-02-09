import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryFolderProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    article_count: number;
  };
}

export default function CategoryFolder({ category }: CategoryFolderProps) {
  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
        {/* Folder tab */}
        <div className="h-3 w-2/5 rounded-t-md bg-primary/80 -mb-1" />

        <CardContent className="rounded-t-lg border-t bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <h3 className="font-semibold text-lg leading-tight group-hover:underline truncate">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>

            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {category.article_count}{" "}
              {category.article_count === 1 ? "article" : "articles"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
