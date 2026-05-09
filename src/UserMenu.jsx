import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";

const C = {
  crimson: "#8B0000",
  gold: "#D4A017",
  white: "#fff",
  dark: "#1a1a1a",
  gray: "#555",
};

const TIER_LABELS = {
  monthly: { label: "Monthly", color: "#2563eb" },
  lifetime: { label: "Lifetime", color: "#8B0000" },
  bundle: { label: "Bundle", color: "#7c3aed" },
};

export default function UserMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const tier = user.publicMetadata?.access_tier;
  const tierInfo = TIER_LABELS[tier] || null;
  const displayName = user.firstName || user.emailAddresses?.[0]?.emailAddress || "Student";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.15)",
          border: `1px solid rgba(212,160,23,0.5)`,
          borderRadius: 8,
          padding: "6px 12px",
          cursor: "pointer",
          color: C.white,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>👤</span>
        <span>{displayName}</span>
        {tierInfo && (
          <span style={{
            background: tierInfo.color,
            color: C.white,
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            letterSpacing: 0.5,
          }}>
            {tierInfo.label.toUpperCase()}
          </span>
        )}
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: C.white,
          border: "1px solid #e0e0e0",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          minWidth: 200,
          zIndex: 1000,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}>
            <div style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
              {user.emailAddresses?.[0]?.emailAddress}
            </div>
            {tierInfo && (
              <div style={{
                display: "inline-block",
                marginTop: 6,
                background: tierInfo.color,
                color: C.white,
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: 10,
                letterSpacing: 0.5,
              }}>
                {tierInfo.label.toUpperCase()} ACCESS
              </div>
            )}
          </div>

          <SignOutButton>
            <button
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
                color: C.crimson,
                fontWeight: 600,
              }}
            >
              Sign Out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
