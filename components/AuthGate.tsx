"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const publicRoutes = new Set(["/login", "/signup"]);

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    if (isPublicRoute) {
      setIsChecking(false);
      return;
    }

    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      } else {
        setIsChecking(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isPublicRoute, pathname, router]);

  if (isChecking) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Checking session</p>
          <h1 style={{ fontSize: 36 }}>Loading YumiTrack</h1>
          <p className="hint-text" style={{ marginTop: 12 }}>
            Please wait while we verify your login.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
