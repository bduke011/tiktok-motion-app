"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/dashboard");
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen pt-16">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </>
  );
}
