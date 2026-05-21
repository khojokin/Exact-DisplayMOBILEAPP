import { useUser } from "@clerk/clerk-expo";

const DEFAULT_ADMIN_EMAILS = ["kingsfordkojo7@icloud.com"];

export function useAdmin() {
  const { user } = useUser();

  const metadata = (user?.publicMetadata as { role?: string } | undefined) ?? {};
  const role = metadata.role?.toLowerCase() ?? "member";

  const envAdmins = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedEmails = new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]);
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  const isAdmin = role === "admin" || (!!primaryEmail && allowedEmails.has(primaryEmail));

  return {
    isAdmin,
    role,
    email: primaryEmail,
  };
}
