import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post, getPostBySlug, getAllPosts } from "@/lib/posts";
import { Calendar, ChevronLeft, User } from "lucide-react";
import Link from "next/link";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post: Post = await getPostBySlug(slug);

  return (
    <>
      <Link href="/blog">
        <Button variant={"secondary"}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Πίσω
        </Button>
      </Link>
      <main className="container mx-auto px-4 py-10">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>

        {/* Meta row: date, author, tags */}
        <div className="flex flex-wrap items-center gap-3 mb-8 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" /> {post.author}
          </span>
          <div className="flex gap-2 flex-wrap">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Markdown Content */}
        <article className="prose max-w-none prose-slate">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
      </main>
    </>
  );
}
