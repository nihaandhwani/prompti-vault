"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Author {
  id: string;
  full_name: string;
}

export default function AuthorFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authors, setAuthors] = useState<Author[]>([]);
  const currentAuthor = searchParams.get("author") ?? "";

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const res = await fetch("/api/authors");
        if (res.ok) {
          const data: Author[] = await res.json();
          setAuthors(data);
        }
      } catch {
        // Silently fail - dropdown will remain empty
      }
    }
    fetchAuthors();
  }, []);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("author");
    } else {
      params.set("author", value);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname);
  };

  return (
    <Select value={currentAuthor || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by author" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Authors</SelectItem>
        {authors.map((author) => (
          <SelectItem key={author.id} value={author.id}>
            {author.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
