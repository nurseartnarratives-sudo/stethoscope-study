import { useUser, useAuth } from "@clerk/clerk-react";
import LandingGate from "./LandingGate.jsx";
import RenewalPage from "./RenewalPage.jsx";
import UserMenu from "./UserMenu.jsx";
import App from "./App.jsx";

// The LOGO is defined inside App.jsx — we re-export it here for the gate pages
// It's a base64 PNG embedded in the original file
const LOGO_PLACEHOLDER = null; // Clerk gate pages will work without logo if not passed

export default function AuthWrapper() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // While Clerk loads, show a minimal splash
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFF8E7",
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <div style={{ textAlign: "center", color: "#8B0000" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🩺</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Loading Stethoscope Study…</div>
        </div>
      </div>
    );
  }

  // Not signed in → show landing page with pricing
  if (!isSignedIn) {
    return <LandingGate logoSrc={LOGO_PLACEHOLDER} />;
  }

  // Signed in — check access tier
  const tier = user?.publicMetadata?.access_tier;

  // Monthly users: check if their subscription is still active
  // You set access_tier = null or remove it when subscription lapses
  // If they're signed in but have no tier at all, show renewal
  if (!tier) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFF8E7",
        fontFamily: "'Segoe UI', sans-serif",
        flexDirection: "column",
        gap: 16,
        padding: 24,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>⏳</div>
        <h2 style={{ color: "#8B0000", fontWeight: 800, fontSize: 22 }}>
          Access Pending
        </h2>
        <p style={{ color: "#555", maxWidth: 400, lineHeight: 1.6 }}>
          Your account has been created but your access tier hasn't been set yet.
          If you've already purchased, please allow a few minutes and refresh — or
          contact support.
        </p>
        <a
          href="mailto:nurse.artnarratives@gmail.com"
          style={{
            background: "#8B0000",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Contact Support
        </a>
      </div>
    );
  }

  // Monthly tier with lapsed access
  if (tier === "monthly_expired") {
    return <RenewalPage logoSrc={LOGO_PLACEHOLDER} />;
  }

  // Valid access (monthly, lifetime, or bundle) → show the app with user menu overlay
  return (
    <div style={{ position: "relative" }}>
      {/* Floating user menu — sits on top of the app in the top-right corner */}
      <div style={{
        position: "fixed",
        top: 12,
        right: 16,
        zIndex: 9999,
      }}>
        <UserMenu />
      </div>

      {/* The full app */}
      <App />
    </div>
  );
}
