"use client";

import FileUpload from "@/components/local/FileUpload";

export default function Files() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <FileUpload />
      </div>
    </div>
  );
}

