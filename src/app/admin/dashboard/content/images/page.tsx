"use client";

import ImageUpload from "@/components/local/ImageUpload";

export default function DashboardContent() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <ImageUpload />
      </div>
    </div>
  );
}

