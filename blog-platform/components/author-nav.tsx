"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/my-articles", label: "My Articles" },
  { href: "/new-article", label: "New Article" },
];

export default function AuthorNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex h-full w-64 flex-col border-r bg-muted/40 p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Author Panel</h2>
      </div>

      <ul className="flex flex-1 flex-col gap-1">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
