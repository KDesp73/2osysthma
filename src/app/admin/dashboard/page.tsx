"use client";

import GitHistory from "@/components/local/GitHistory";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>

      <section className="bg-white rounded-2xl shadow p-6">
        <GitHistory />
      </section>
    </div>
  );
}
