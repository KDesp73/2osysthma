import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import Title from "@/components/local/Title";
import { Badge } from "@/components/ui/badge";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const posts = getAllPosts();
  const { tag } = await searchParams;

  // Filter posts by tag if query param exists
  const filteredPosts = tag
    ? posts.filter((post) => post.tags.includes(tag as string))
    : posts;

  // Collect all unique tags
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  return (
    <>
      <Title name="To blog μας" />

      {/* Tag Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/blog">
          <Badge variant={tag ? "outline" : "default"}>All</Badge>
        </Link>
        {allTags.map((t) => (
          <Link key={t} href={`/blog?tag=${t}`}>
            <Badge variant={tag === t ? "default" : "outline"}>{t}</Badge>
          </Link>
        ))}
      </div>

      {/* Blog Posts */}
      <div className="grid gap-8">
        {filteredPosts.map((post) => (
          <Card key={post.slug} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">{post.title}</h1>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>{post.date.split("T")[0]}</time>
                  {post.author && (
                    <>
                      <User className="h-4 w-4" />
                      {post.author}
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{post.description}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/blog/${post.slug}`}>
                <Button variant="outline">Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
