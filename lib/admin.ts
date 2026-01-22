import { Session } from "next-auth";

/**
 * Check if an email belongs to an admin user
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Check if a session belongs to an admin user
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin === true;
}

/**
 * Throw an error if the session is not an admin
 * Use this in API routes to protect admin endpoints
 */
export function requireAdmin(session: Session | null): void {
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (!session.user.isAdmin) {
    throw new Error("Forbidden");
  }
}
