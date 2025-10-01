"use client";

import ChangePasswordForm from "@/components/local/ChangePasswordForm";
import Loading from "@/components/local/Loading";
import UserManager from "@/components/local/UserManager";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function DashboardSettings() {
  const { user, loading } = useAuthUser();

  if (loading) return <Loading />;

  const username = user?.username;

  return (
    <>
      {username === "admin" ? (
        <>
          <UserManager />
        </>
      ) : (
        <>
          <ChangePasswordForm />
        </>
      )}
    </>
  );
}
