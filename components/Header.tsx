"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Sparkles, ChevronDown, Video, Image } from "lucide-react";
import { CreditDisplay } from "./CreditDisplay";

export function Header() {
  const { data: session, status } = useSession();
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-xl font-bold gradient-text hidden sm:block">AI Creator Studio</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-[var(--surface)] animate-pulse" />
            ) : session ? (
              <>
                {/* Create Links */}
                <Link
                  href="/avatar"
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Create Avatar
                </Link>
                <Link
                  href="/create"
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Create Video
                </Link>
                <Link
                  href="/combine"
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Combine
                </Link>

                {/* Gallery Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setGalleryOpen(!galleryOpen)}
                    onBlur={() => setTimeout(() => setGalleryOpen(false), 150)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    Gallery
                    <ChevronDown className={`w-4 h-4 transition-transform ${galleryOpen ? "rotate-180" : ""}`} />
                  </button>

                  {galleryOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--surface)] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                      <Link
                        href="/create/gallery"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Videos
                      </Link>
                      <Link
                        href="/avatar/gallery"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        Avatars
                      </Link>
                    </div>
                  )}
                </div>

                {/* Credits */}
                <CreditDisplay />

                {/* User Menu */}
                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-white/10">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-white hidden md:block">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/pricing"
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 btn-primary rounded-lg font-medium text-white text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
