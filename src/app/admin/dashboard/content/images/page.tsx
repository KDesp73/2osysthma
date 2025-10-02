"use client";

import ImageManager from "@/components/local/cms/ImageManager";


export default function DashboardContent() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <ImageManager />
      </div>
    </div>
  );
}
