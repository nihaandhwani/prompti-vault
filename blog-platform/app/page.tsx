import { Suspense } from "react";
import { getCategoriesWithCounts } from "@/actions/categories";
import SearchBar from "@/components/search-bar";
import AuthorFilter from "@/components/author-filter";
import CategoryFolder from "@/components/category-folder";

export default async function HomePage() {
  const { data: categories } = await getCategoriesWithCounts();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Browse articles by category
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={null}>
          <AuthorFilter />
        </Suspense>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryFolder key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No categories yet
        </p>
      )}
    </div>
  );
}
