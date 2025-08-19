import Link from "next/link"
import { getAllPosts } from "@/lib/posts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"
import Title from "@/components/local/Title"
import { Badge } from "@/components/ui/badge"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
      <>
      <Title name="To blog μας" />
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
                  {post.author != null ? (<>
                      <User className="h-4 w-4" />
                      {post.author}
                  </>) : (<></>)}
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
  )
}
