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

function greekToLatin(str: string) {
  const map: Record<string, string> = {
    α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th",
    ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p",
    ρ: "r", σ: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
    ά: "a", έ: "e", ή: "i", ί: "i", ό: "o", ύ: "y", ώ: "o", ς: "s",
    Ά: "A", Έ: "E", Ή: "I", Ί: "I", Ό: "O", Ύ: "Y", Ώ: "O",
  };
  return str
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}


export function createSlug(title: string): string {
    const latinTitle = greekToLatin(title.toLowerCase());
    return latinTitle
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory)

  const posts = fileNames.map((fileName) => {
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
      tags: data.tags,
    }
  }) as Post[]

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
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
