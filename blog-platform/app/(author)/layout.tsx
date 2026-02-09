import AuthorNav from "@/components/author-nav";

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AuthorNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
