"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Sparkles, ChevronDown, Video, Image, Layers } from "lucide-react";
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
          <nav className="flex items-center gap-1 sm:gap-2">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-[var(--surface)] animate-pulse" />
            ) : session ? (
              <>
                {/* Workflow Links - Ordered: Avatar → Combine → Video → Gallery */}
                <Link
                  href="/avatar"
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Image className="w-4 h-4 hidden sm:block" />
                  <span>Avatar</span>
                </Link>
                <Link
                  href="/combine"
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4 hidden sm:block" />
                  <span>Combine</span>
                </Link>
                <Link
                  href="/create"
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4 hidden sm:block" />
                  <span>Video</span>
                </Link>

                {/* Gallery Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setGalleryOpen(!galleryOpen)}
                    onBlur={() => setTimeout(() => setGalleryOpen(false), 150)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    Gallery
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${galleryOpen ? "rotate-180" : ""}`} />
                  </button>

                  {galleryOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--surface)] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                      <Link
                        href="/avatar/gallery"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        Avatars
                      </Link>
                      <Link
                        href="/create/gallery"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Videos
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
                  Start Free Trial
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
