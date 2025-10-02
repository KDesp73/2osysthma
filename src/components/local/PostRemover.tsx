"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/posts";
import { Button } from "../ui/button";

export default function PostRemover() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/posts");
      if (!res.ok) {
        console.error("Failed to fetch posts");
        return;
      }
      const data = await res.json();
      setPosts(data.posts as Post[]);
    }
    fetchPosts();
  }, []);

  const handleDelete = async (title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      // if (!res.ok) {
      //     throw new Error("Network response was not ok");
      // }

      const resBody = await res.json();
      console.log(resBody);
      if (!resBody.success) {
        throw new Error("Could not remove blog");
      }

      setPosts((prev) => prev.filter((b) => b.title !== title));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete blog. Please try again.");
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Blogs</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No blogs yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((blog) => (
            <li
              key={blog.title}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span>{blog.title}</span>
              <Button
                onClick={async () => {
                  await handleDelete(blog.title);
                }}
                className="px-3 py-1 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
