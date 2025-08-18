import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Heading1 } from "lucide-react"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <Card key={post.slug} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <h1
                  className="text-2xl font-semibold"
                >
                  {post.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>{post.date}</time>
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
    </main>
  )
}
