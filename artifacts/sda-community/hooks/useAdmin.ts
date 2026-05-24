import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";

const ADMIN_EMAILS = [
  "admin@sdacommunity.app",
  "pastor@sdacommunity.app",
];

export function useAdmin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isLoaded) return;
      if (!mounted) return;
      const userEmail = user?.primaryEmailAddress?.emailAddress ?? undefined;
      setEmail(userEmail);
      setIsAdmin(!!userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase()));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [isLoaded, user]);

  return { isAdmin, email, loading, role: isAdmin ? "admin" : "member" };
}
