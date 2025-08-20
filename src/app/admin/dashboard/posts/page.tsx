"use client";

import PostEditor from "@/components/local/PostEditor";
import PostRemover from "@/components/local/PostRemover";

export default function DashboardPost() {

  return (
    <div className="flex flex-row items-start justify-start min-h-screen bg-gray-50 py-8 gap-8 px-8">
      <section className="flex-1 bg-white p-6 rounded-2xl shadow-md">
        <PostEditor />
      </section>

      <section className="w-1/3 bg-white p-6 rounded-2xl shadow-md">
        <PostRemover />
      </section>
    </div>
  );
}
