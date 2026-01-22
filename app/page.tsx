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
  CreditCard,
  Play,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to create page
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/avatar");
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
                  Create AI-powered product videos in minutes
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Turn Your Photos Into
                <br />
                <span className="gradient-text">Viral Ad Videos</span>
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
                Create a digital avatar of yourself, combine it with your products,
                and generate stunning video ads—all with AI. No filming required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--surface)] hover:bg-[var(--surface)]/80 border border-white/10 rounded-xl font-semibold text-lg text-white transition-colors"
                >
                  View Pricing
                </Link>
              </div>

              {/* Card required notice */}
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-8">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">First month free, then $4/month. Cancel anytime.</span>
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

        {/* How it Works - Workflow */}
        <section className="py-24 bg-[var(--surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Your <span className="gradient-text">Creative Workflow</span>
              </h2>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                From avatar to viral video in four simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/5 hover:border-[var(--secondary)]/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--secondary)]/20 rounded-full flex items-center justify-center text-lg font-bold text-[var(--secondary)]">
                      1
                    </div>
                    <Image className="w-6 h-6 text-[var(--secondary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create Your Avatar</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Generate an AI avatar from a text description, or upload your photo
                    and transform it into the perfect spokesperson for your brand.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/20" />
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-lg font-bold text-purple-500">
                      2
                    </div>
                    <Layers className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Add Your Products</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Use our Photo Combiner to merge your avatar with products—lipstick,
                    clothing, gadgets. Up to 4 images blended with AI precision.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/20" />
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/5 hover:border-orange-500/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-lg font-bold text-orange-500">
                      3
                    </div>
                    <Play className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Record Your Moves</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Film a quick reference video of yourself doing the actions you want—talking,
                    dancing, showcasing a product. This becomes your motion template.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/20" />
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/5 hover:border-[var(--primary)]/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-lg font-bold text-[var(--primary)]">
                      4
                    </div>
                    <Video className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Generate Your Video</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Upload your avatar and reference video. Choose to keep a static pose
                    or mirror your exact movements. Click generate—your AI twin comes to life.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
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

        {/* Features Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Powerful <span className="gradient-text">AI Tools</span>
              </h2>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                Everything you need to create professional content, no experience required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--secondary)]/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Image className="w-7 h-7 text-[var(--secondary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Avatar Generator</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Create your digital twin from text or transform your photos
                  into stunning AI avatars with unique artistic styles.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    4 variations per generation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Text-to-image creation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Photo transformation
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Photo Combiner</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Seamlessly blend your avatar with products, backgrounds,
                  or other elements. Perfect for product showcases.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Combine up to 4 images
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Natural AI blending
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Prompt-guided results
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-[var(--surface)] rounded-2xl p-8 border border-white/5 hover:border-[var(--primary)]/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Video Creator</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Bring your avatar to life. Upload a reference video and watch
                  your AI twin mirror every movement perfectly.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    5-second TikTok-ready clips
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Pose or motion tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check className="w-4 h-4 text-green-400" />
                    Instant download
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-24 bg-[var(--surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Simple <span className="gradient-text">Pricing</span>
              </h2>
              <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                Start free, upgrade when you need more power.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {/* Starter */}
              <div className="bg-[var(--secondary)]/5 rounded-2xl p-6 border border-[var(--secondary)]/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--secondary)] text-black text-xs font-medium rounded-full">
                  Free Trial
                </div>
                <h3 className="text-lg font-semibold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-1">$0</div>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  first month
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  then $4/month
                </p>
              </div>

              {/* Pro */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-1">$20</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  /month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  2,000 credits
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
                  /month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  5,000 credits
                </p>
              </div>

              {/* Corporate */}
              <div className="bg-[var(--surface)] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Corporate</h3>
                <div className="text-3xl font-bold mb-1">$100</div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  /month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  10,000 credits
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
                  <span className="text-sm">Join creators going viral</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Ready to Create Your AI Twin?
                </h2>
                <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
                  Start with 250 free credits. Build your avatar, showcase your products,
                  and create scroll-stopping videos today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 btn-primary rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-lg text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </div>

                <p className="text-sm text-[var(--text-muted)] mt-4">
                  Card required • Cancel anytime • First month free
                </p>
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
