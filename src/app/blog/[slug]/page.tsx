import { Button } from "@/components/ui/button";
import { Post, getPostBySlug, getAllPosts } from "@/lib/posts"
import { ChevronLeft } from "lucide-react";
import Link from "next/link"


interface PostPageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post: Post = await getPostBySlug(slug);

  return (
    <>
    <Link
        href="/blog"
    >
        <Button
            variant={"secondary"}
        >
            <ChevronLeft/>
            Πίσω
        </Button>
    </Link>
    <main className="container mx-auto px-4 py-10">
      {/* Title + Date */}
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{post.date}</p>

      {/* Markdown Content */}
      <article className="prose max-w-none prose-slate">
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
    </main>
    </>
  )
}
