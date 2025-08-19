import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const postsDirectory = path.join(process.cwd(), "public/content/blog")

export interface Post {
    slug: string
    title: string
    date: string
    description?: string
    author?: string
    tags: [string]
    contentHtml: string
}


interface FrontMatter {
    title: string
    date: string
    description?: string
    author?: string
    tags: [string]
}

export function getAllPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory)

    return fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const filePath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(filePath, "utf8")
        const { data } = matter(fileContents) as unknown as { data: FrontMatter }

        return {
            slug,
            title: data.title,
            date: data.date,
            description: data.description,
            author: data.author,
            tags: data.tags
        }
    }) as Post[]
}


export async function getPostBySlug(slug: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents) as unknown as { data: FrontMatter; content: string }
    const contentHtml = (await remark().use(html).process(content)).toString()

    return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        author: data.author,
        tags: data.tags,
        contentHtml,
    }
}
