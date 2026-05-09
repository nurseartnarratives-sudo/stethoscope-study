import { SignOutButton } from "@clerk/clerk-react";

const C = {
  crimson: "#8B0000",
  gold: "#D4A017",
  cream: "#FFF8E7",
  dark: "#1a1a1a",
  gray: "#555",
  white: "#fff",
};

const BEACONS_URL = "https://beacons.ai/YOUR_STORE_LINK";

export default function RenewalPage({ logoSrc }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.cream} 0%, #fff 100%)`,
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center",
    }}>
      {logoSrc && (
        <img src={logoSrc} alt="Nutty Nurse" style={{ height: 90, marginBottom: 24 }} />
      )}

      <div style={{
        background: C.white,
        border: `2px solid ${C.gold}`,
        borderRadius: 16,
        padding: "48px 40px",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
        <h2 style={{ color: C.crimson, fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          Your Access Has Expired
        </h2>
        <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Your monthly subscription is no longer active. Renew now to get back to studying — or upgrade to Lifetime access and never worry about renewals again!
        </p>

        <a
          href={BEACONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: C.crimson,
            color: C.white,
            padding: "14px 0",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          Renew or Upgrade Now
        </a>

        <SignOutButton>
          <button style={{
            background: "transparent",
            border: `1px solid #ccc`,
            color: C.gray,
            padding: "10px 0",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
          }}>
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
