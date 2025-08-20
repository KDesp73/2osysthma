"use client";

import PostEditor from "@/components/local/PostEditor";
import PostRemover from "@/components/local/PostRemover";

export default function DashboardPosts() {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-start min-h-screen py-8 gap-8 px-4 lg:px-8">
      {/* Post Editor Section */}
      <section className="flex-1 bg-white p-6 rounded-2xl shadow-md w-full">
        <PostEditor />
      </section>

      {/* Post Remover Section */}
      <section className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-md w-full">
        <PostRemover />
      </section>
    </div>
  );
}
