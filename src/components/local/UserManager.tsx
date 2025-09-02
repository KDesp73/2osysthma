"use client";

import { useEffect, useState } from "react";
import PasswordField from "./PasswordField";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function UserManager() {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("1234");

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
    setPassword("1234");
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create User Form */}
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <PasswordField
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="default" onClick={createUser}>
              Create User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex justify-between items-center rounded-lg border p-3 bg-muted/30"
              >
                <span className="font-medium">{u.username}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// TODO: Split into 2 components
