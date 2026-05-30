import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabase";

export type AdminRole = "admin" | "super_admin" | "moderator" | "member";

interface AdminState {
  isAdmin: boolean;
  role: AdminRole;
  email: string | undefined;
  loading: boolean;
}

export function useAdmin(): AdminState {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<AdminRole>("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) {
      setRole("member");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setRole("member");
        } else {
          const dbRole = (data as { role?: string }).role;
          if (dbRole === "admin" || dbRole === "super_admin" || dbRole === "moderator") {
            setRole(dbRole);
          } else {
            setRole("member");
          }
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]);

  return {
    isAdmin: role === "admin" || role === "super_admin",
    role,
    email: user?.primaryEmailAddress?.emailAddress,
    loading,
  };
}
