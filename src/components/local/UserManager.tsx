"use client";

import { useEffect, useState } from "react";
import PasswordField from "./PasswordField";
import { Input } from "../ui/input";

export default function UserManager() {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Create User Form */}
      <div className="mb-6 space-y-2">
        <Input
          type="text"
          placeholder="Username"
          className="border p-2 w-full rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordField
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
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

// TODO: Split into 2 components
