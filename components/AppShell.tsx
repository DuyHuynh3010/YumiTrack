import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, CalendarDays, Home, LogOut, PlusCircle } from "lucide-react";

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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">弓</span>
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
        </nav>

        <div className="profile-panel">
          <span className="avatar">DH</span>
          <div>
            <strong>Duy Huynh</strong>
            <small>Demo account</small>
          </div>
          <LogOut size={18} aria-hidden="true" />
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
