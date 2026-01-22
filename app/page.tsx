"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Video, Image, Zap, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to create page
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/create");
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If authenticated, show nothing while redirecting
  if (session) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">AI-Powered</span>
                <br />
                Video Creation
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
                Transform any photo into viral TikTok videos with AI motion control.
                Create unique avatars. All in one studio.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--surface)] hover:bg-[var(--surface)]/80 rounded-xl font-semibold text-lg text-white transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[var(--surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Everything You Need to <span className="gradient-text">Go Viral</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--primary)]/30 transition-colors">
                <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Motion Creator</h3>
                <p className="text-[var(--text-muted)]">
                  Upload any photo and a reference video. Our AI will animate your character
                  to match the exact movements and dance moves.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--secondary)]/30 transition-colors">
                <div className="w-14 h-14 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Image className="w-7 h-7 text-[var(--secondary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Avatar Generator</h3>
                <p className="text-[var(--text-muted)]">
                  Create stunning AI avatars from text descriptions or transform
                  existing photos into unique artistic styles.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-[var(--text-muted)]">
                  Powered by cutting-edge AI models. Get your videos and avatars
                  generated in minutes, not hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-3xl p-12 border border-white/10">
              <Sparkles className="w-12 h-12 text-[var(--primary)] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Create?
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-8">
                Join thousands of creators making viral content with AI.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white"
              >
                Start Creating Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>AI Creator Studio</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
