"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, Users, BarChart3, ArrowLeft } from "lucide-react";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold text-red-500">Admin Portal</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/admin"
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/admin"
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>

            <div className="h-6 w-px bg-white/10 mx-2" />

            <Link
              href="/"
              className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to App</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-white/10">
              <span className="text-sm text-white hidden md:block">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
