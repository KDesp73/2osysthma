"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordField from "@/components/local/PasswordField";
import { Button } from "../ui/button";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    } else {
        setMessage(data.message || data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-md">
      <PasswordField
        id="old-password"
        name="oldPassword"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <PasswordField
        id="new-password"
        name="newPassword"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        showStrength
      />
      <PasswordField
        id="confirm-password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button type="submit">
        Change Password
      </Button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
