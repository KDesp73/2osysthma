"use client";

import FileManager from "@/components/local/cms/FileManager";

export default function Files() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <FileManager />
      </div>
    </div>
  );
}
