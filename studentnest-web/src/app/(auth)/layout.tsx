import Link from "next/link";
import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link className="auth-brand" href="/" aria-label="StudentNest home">
          <span className="auth-brandMark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7" />
            </svg>
          </span>
          <span>
            StudentNest
            <small>Ahmedabad</small>
          </span>
        </Link>
        <Link className="auth-browseLink" href="/pgs">
          Browse sample PGs
        </Link>
      </header>
      {!configured && (
        <p className="auth-configNotice" role="status">
          Authentication is not connected yet. Configure Supabase using the
          setup instructions in the project README.
        </p>
      )}
      <main className="auth-main">{children}</main>
      <footer className="auth-footer">
        StudentNest Ahmedabad · Sample accommodation data only
      </footer>
    </div>
  );
}
