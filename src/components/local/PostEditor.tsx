import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    DiffSourceToggleWrapper,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    MDXEditor, 
    UndoRedo, 
    diffSourcePlugin, 
    headingsPlugin, 
    imagePlugin, 
    linkPlugin, 
    linkDialogPlugin, 
    listsPlugin, 
    markdownShortcutPlugin, 
    quotePlugin, 
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import style from "@/styles/post.module.css";
import Link from "next/link";
import { Info } from "lucide-react";


function MyToolbar() {
    return (
        <DiffSourceToggleWrapper>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <InsertImage />
            <InsertTable />
            <InsertThematicBreak />
            <BlockTypeSelect />
        </DiffSourceToggleWrapper>
    );
}

const PLUGINS = [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [2, 3, 4] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
        imageUploadHandler: () => {
            // TODO: upload image to a seperate folder and use the resulting url
            return Promise.resolve('https://picsum.photos/200/300')
        },
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
    markdownShortcutPlugin(),
    toolbarPlugin({ toolbarContents: () => <MyToolbar /> }),
]


export default function PostEditor() {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    tags: "",
  });


  const handleBlogChange = (e: ChangeEvent<HTMLInputElement>) => {
      setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value: string) => {
    setBlogData({ ...blogData, content: value });
  };

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
        type: "blog",
        ...blogData,
        tags: blogData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
        const res = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [payload] }),
        });

      const data = await res.json();
      setMessage(data.success ? "Blog created successfully!" : "Error creating blog");
      setError(!data.success);
      if(data.success){
          setBlogData({
              title: "",
              description: "",
              author: "",
              date: new Date().toISOString().split("T")[0],
              content: "",
              tags: "",
          });
      }
    } catch {
      setMessage("Error creating blog");
      setError(true);
    }
  };



    return (<>
        <div className="flex flex-row gap-4">
            <h2 className="text-2xl font-semibold mb-4">Create Blog Post</h2>
            <Link
                href={"https://onlinemarkdown.com/syntax"}
                target="_blank"
            >
                <Info />
            </Link>
        </div>

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
                contentEditableClassName={style.editor}
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

    </>);
}
