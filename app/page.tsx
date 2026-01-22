"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Video,
  Image,
  ArrowRight,
  Check,
  Users,
  TrendingUp,
  Layers,
} from "lucide-react";
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
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface)] rounded-full border border-white/10 mb-8">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text-muted)]">
                  Powered by cutting-edge AI
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Create <span className="gradient-text">Viral Videos</span>
                <br />
                in Minutes
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
                Transform any photo into stunning TikTok videos with AI motion
                control. Generate unique avatars. Go viral faster.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--surface)] hover:bg-[var(--surface)]/80 border border-white/10 rounded-xl font-semibold text-lg text-white transition-colors"
                >
                  View Pricing
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-6 text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">1,000+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span className="text-sm">50,000+ videos created</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[var(--surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything You Need to{" "}
                <span className="gradient-text">Go Viral</span>
              </h2>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                Professional-grade AI tools at your fingertips. No experience
                required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--primary)]/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Motion Creator</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Upload any photo and a reference video. Our AI animates your
                  character to match exact movements and dance moves.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Any photo works
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    5-second videos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    TikTok ready
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--secondary)]/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Image className="w-7 h-7 text-[var(--secondary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Avatar Generator</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Create stunning AI avatars from text descriptions or transform
                  existing photos into unique artistic styles.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />4 images per
                    generation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Text-to-image
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Image-to-image
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Photo Combiner</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Merge multiple photos together seamlessly. Combine faces,
                  styles, and elements into one perfect image.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Up to 4 source images
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Prompt control
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    High quality output
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Simple, <span className="gradient-text">Credit-Based</span>{" "}
                Pricing
              </h2>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                Pay only for what you use. $1 = 100 credits. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {/* Free */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-1">$0</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  250 credits/month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Perfect for trying out
                </p>
              </div>

              {/* Pro */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-1">$20</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  2,000 credits/month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  For regular creators
                </p>
              </div>

              {/* Business */}
              <div className="bg-gradient-to-b from-[var(--primary)]/20 to-transparent rounded-2xl p-6 border border-[var(--primary)]/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                  Popular
                </div>
                <h3 className="text-lg font-semibold mb-2">Business</h3>
                <div className="text-3xl font-bold mb-1">$50</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  5,000 credits/month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  For power users
                </p>
              </div>

              {/* Corporate */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Corporate</h3>
                <div className="text-3xl font-bold mb-1">$100</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  10,000 credits/month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  For teams & agencies
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface)]/80 border border-white/10 rounded-xl font-medium text-white transition-colors"
              >
                See Full Pricing Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-[var(--surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-[var(--text-muted)] text-lg">
                Create viral content in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-[var(--primary)]">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload</h3>
                <p className="text-[var(--text-muted)]">
                  Upload your photo and choose a motion reference video or
                  describe what you want.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--secondary)]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-[var(--secondary)]">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Generate</h3>
                <p className="text-[var(--text-muted)]">
                  Our AI processes your content and creates stunning videos or
                  images in minutes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-purple-500">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Share</h3>
                <p className="text-[var(--text-muted)]">
                  Download your creation and share it on TikTok, Instagram, or
                  any platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-3xl p-12 border border-white/10 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--secondary)]/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Join the viral revolution</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Ready to Create?
                </h2>
                <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
                  Start with 250 free credits. No credit card required. Create
                  your first viral video today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
                  >
                    Start Creating Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-lg text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                <span className="font-semibold">AI Creator Studio</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
                <a href="mailto:support@example.com" className="hover:text-white transition-colors">
                  Support
                </a>
              </div>

              <p className="text-sm text-[var(--text-muted)]">
                © 2025 AI Creator Studio. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
