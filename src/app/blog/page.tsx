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
import { filter } from "@mdxeditor/editor";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; author?: string }>;
}) {
  const posts = getAllPosts();
  const { tag, author } = await searchParams;

  const filteredPosts = posts.filter((post) => {
    const tagMatch = tag ? post.tags.includes(tag) : true;
    const authorMatch = author ? post.author === author : true;
    return tagMatch && authorMatch;
  });

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  const allAuthors = Array.from(
    new Set(posts.map((post) => post.author).filter(Boolean))
  );

  return (
    <>
      <Title name="To blog μας" />

      {/* Tag Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href={author ? `/blog?author=${author}` : "/blog"}>
          <Badge variant={tag ? "outline" : "default"}>All Tags</Badge>
        </Link>

        {allTags.map((t) => (
          <Link
            key={t}
            href={`/blog?${new URLSearchParams({
              ...(author && { author }),
              tag: t,
            }).toString()}`}
          >
            <Badge variant={tag === t ? "default" : "outline"}>{t}</Badge>
          </Link>
        ))}
      </div>

      {/* Author Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href={tag ? `/blog?tag=${tag}` : "/blog"}>
          <Badge variant={author ? "outline" : "default"}>All Authors</Badge>
        </Link>

        {allAuthors.map((a) => {
          if(!a) return;
          const params = new URLSearchParams();
          if (tag) params.set("tag", tag);
          params.set("author", a);

          return (
            <Link key={a} href={`/blog?${params.toString()}`}>
              <Badge variant={author === a ? "default" : "outline"}>{a}</Badge>
            </Link>
          );
        })}
      </div>

      <div className="text-slate-800 text-xl mb-4">
        <span className="text-green-800 text-2xl">{filteredPosts.length}</span> posts
      </div>

      {/* Blog Posts */}
      <div className="grid gap-8">
        {filteredPosts.map((post) => (
          <Card
            key={post.slug}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">{post.title}</h1>

                <div className="flex items-center text-sm text-gray-500 gap-2 flex-wrap">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {post.date.split("T")[0]}
                  </time>

                  {post.author && (
                    <>
                      <User className="h-4 w-4 ml-2" />
                      <Link
                        href={`/blog?author=${post.author}`}
                        className="hover:underline"
                      >
                        {post.author}
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/blog?${new URLSearchParams({
                        ...(author && { author }),
                        tag: t,
                      }).toString()}`}
                    >
                      <Badge variant="secondary">{t}</Badge>
                    </Link>
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
