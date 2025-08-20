"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    DiffSourceToggleWrapper,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    MDXEditor, 
    UndoRedo, 
    codeBlockPlugin, 
    codeMirrorPlugin, 
    diffSourcePlugin, 
    headingsPlugin, 
    imagePlugin, 
    linkDialogPlugin, 
    linkPlugin, 
    listsPlugin, 
    markdownShortcutPlugin, 
    quotePlugin, 
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import "@/styles/post.module.css"

function MyToolbar() {
    return (
        <DiffSourceToggleWrapper>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <InsertImage />
            <InsertTable />
            <InsertThematicBreak />
            <InsertCodeBlock />
            <BlockTypeSelect />
        </DiffSourceToggleWrapper>
    );
}

const PLUGINS = [
  toolbarPlugin({ toolbarContents: () => <MyToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({
    imageAutocompleteSuggestions: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    imageUploadHandler: async () => Promise.resolve('https://picsum.photos/200/300')
  }),
  tablePlugin(),
  thematicBreakPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
  codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'Plain Text', tsx: 'TypeScript', '': 'Unspecified' } }),
  diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
  markdownShortcutPlugin()
]

export default function AdminDashboard() {
  const [blogData, setBlogData] = useState({
    title: "title",
    description: "desc",
    author: "author",
    date: new Date().toISOString().split("T")[0],
    content: "content",
    tags: "tag",
  });

  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBlogChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value: string) => {
    setBlogData({ ...blogData, content: value });
  };

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...blogData,
      tags: blogData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      const res = await fetch("/api/admin/create-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessage(data.success ? "Blog created successfully!" : "Error creating blog");
      setError(!data.success);
    } catch {
      setMessage("Error creating blog");
      setError(true);
    }
  };

  return (<>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
      </header>

      <section className="bg-white rounded-xl shadow p-6 space-y-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold">Create Blog Post</h2>

        <form onSubmit={handleBlogSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            name="title"
            placeholder="Title"
            value={blogData.title}
            onChange={handleBlogChange}
            required
          />
          <Input
            type="text"
            name="description"
            placeholder="Description"
            value={blogData.description}
            onChange={handleBlogChange}
            required
          />
          <Input
            type="text"
            name="author"
            placeholder="Author"
            value={blogData.author}
            onChange={handleBlogChange}
            required
          />
          <Input
            type="date"
            name="date"
            value={blogData.date}
            onChange={handleBlogChange}
            required
          />

          {/* MDX Editor with Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 border rounded-lg overflow-hidden min-h-[300px]">
              <MDXEditor
                markdown={blogData.content}
                onChange={handleContentChange}
                contentEditableClassName="prose"
                plugins={PLUGINS}
                className="min-h-[250px] w-full"
              />
            </div>

          <Input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={blogData.tags}
            onChange={handleBlogChange}
          />

          <Button type="submit" className="w-36 mt-2">
            Create Blog
          </Button>
        </form>

        {message && <p className={`text-${(error) ? "red" : "green"}-600 font-medium mt-4`}>{message}</p>}
      </section>
    </>
  );
}
