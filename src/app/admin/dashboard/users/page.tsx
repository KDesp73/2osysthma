"use client";

import Loading from "@/components/local/Loading";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardUsers() {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { user, loading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
      if (!loading && user?.username !== "admin") {
          router.push("/admin/dashboard");
      }
  }, [loading, user, router]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function createUser() {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setUsername("");
    setPassword("");
    fetchUsers();
  }

  async function deleteUser(id: number) {
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  }

  useEffect(() => {
      if (user?.username === "admin") {
          fetchUsers();
      }
  }, [user]);

  if (loading) return <Loading />;

  if (user?.username !== "admin") return null;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Create User Form */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={createUser}
        >
          Create User
        </button>
      </div>

      {/* User List */}
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{u.username}</span>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => deleteUser(u.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
