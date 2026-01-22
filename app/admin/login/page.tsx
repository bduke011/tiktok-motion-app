"use client";

import { useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    error === "CredentialsSignin" ? "Invalid email or password" : ""
  );

  // If already logged in and is admin, redirect to admin dashboard
  if (status === "authenticated") {
    if (session?.user?.isAdmin) {
      router.push("/admin");
      return null;
    } else {
      // Not an admin, show error
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-[var(--text-muted)] mb-6">
              You don&apos;t have admin privileges.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Return to App
            </Link>
          </div>
        </div>
      );
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (result?.error) {
      setErrorMessage("Invalid email or password");
      setLoading(false);
    } else {
      // Check if user is admin after login
      router.push("/admin");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-500">Admin Portal</h1>
          <p className="text-[var(--text-muted)] mt-2">Sign in with your admin account</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-xl border border-red-500/20">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--text-muted)]/30" />
            <span className="text-[var(--text-muted)] text-sm">or</span>
            <div className="flex-1 h-px bg-[var(--text-muted)]/30" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/50 border border-[var(--text-muted)]/30 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/50 border border-[var(--text-muted)]/30 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-[var(--text-muted)] hover:text-white transition-colors">
            ← Back to App
          </Link>
        </p>
      </div>
    </div>
  );
}

function AdminLoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-500">Admin Portal</h1>
          <p className="text-[var(--text-muted)] mt-2">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginLoading />}>
      <AdminLoginContent />
    </Suspense>
  );
}
