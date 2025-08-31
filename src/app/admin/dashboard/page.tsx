"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image, Settings, Github } from "lucide-react";
import { GithubHelper } from "@/lib/GithubHelper";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [history, setHistory] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  const operations = [
    { label: "Posts", icon: <FileText className="h-8 w-8 mb-2" />, path: "/admin/dashboard/posts" },
    { label: "Content", icon: <Image className="h-8 w-8 mb-2" />, path: "/admin/dashboard/content" },
    { label: "Settings", icon: <Settings className="h-8 w-8 mb-2" />, path: "/admin/dashboard/settings" },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
          const params = new URLSearchParams({
              path: "",
              count: "10",
          });

          const res = await fetch(`/api/admin/git-history?${params.toString()}`);
          const commits = await res.json();
          setHistory(commits);
      } catch (err) {
        console.error("Failed to fetch git history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>

      {/* Operations Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {operations.map((op) => (
          <button
            key={op.label}
            onClick={() => router.push(op.path)}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            {op.icon}
            <span className="text-lg font-semibold">{op.label}</span>
          </button>
        ))}
      </section>

      {/* Git History */}
      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center mb-4">
          <Github className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Recent Git Commits</h2>
        </div>

        {loading ? (
          <p>Loading commits...</p>
        ) : history.length === 0 ? (
          <p>No recent commits found.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((c) => (
              <li key={c.sha} className="border rounded p-3 hover:bg-gray-50 transition">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                  {c.message}
                </a>
                <p className="text-sm text-gray-500">
                  {c.author} • {new Date(c.date).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 truncate">{c.sha}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
