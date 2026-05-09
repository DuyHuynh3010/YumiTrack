"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, Home, LogOut, PlusCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/lib/supabase/profiles";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/practice", label: "Practice", icon: PlusCircle },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

type AppShellProps = {
  children: ReactNode;
  activePath?: string;
};

export function AppShell({ children, activePath = "/" }: AppShellProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createSupabaseBrowserClient();

      supabase.auth.getUser().then(({ data }) => {
        if (isMounted) {
          setEmail(data.user?.email ?? null);
        }

        if (data.user) {
          ensureUserProfile(supabase, data.user);
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setEmail(session?.user.email ?? null);

        if (session?.user) {
          ensureUserProfile(supabase, session.user);
        }
      });

      return () => {
        isMounted = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      setEmail(null);
    }
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">Y</span>
          <span>
            <strong>YumiTrack</strong>
            <small>Kyudo journal</small>
          </span>
        </Link>

        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;

            return (
              <Link className={`nav-item${isActive ? " active" : ""}`} href={item.href} key={item.href}>
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          {email ? (
            <button className="nav-item nav-button" onClick={handleLogout} type="button">
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <Link className="nav-item" href="/login">
              <LogOut size={18} aria-hidden="true" />
              Log in
            </Link>
          )}
        </nav>

        <div className="profile-panel">
          <span className="avatar">{email ? email.slice(0, 2).toUpperCase() : "YT"}</span>
          <div>
            <strong>{email ?? "Guest"}</strong>
            <small>{email ? "Logged in" : "Not logged in"}</small>
          </div>
          {email ? (
            <button aria-label="Log out" className="icon-action" onClick={handleLogout} type="button">
              <LogOut size={18} aria-hidden="true" />
            </button>
          ) : (
            <Link aria-label="Log in" className="icon-action" href="/login">
              <LogOut size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
