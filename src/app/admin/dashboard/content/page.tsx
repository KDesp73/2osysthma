"use client";

import ImageUpload from "@/components/local/ImageUpload";
import UsefulFileUpload from "@/components/local/UsefulFileUpload";

export default function DashboardContent() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Images upload half */}
      <div className="flex-1">
        <ImageUpload />
      </div>

      {/* Useful files upload half */}
      <div className="flex-1">
        <UsefulFileUpload />
      </div>
    </div>
  );
}
