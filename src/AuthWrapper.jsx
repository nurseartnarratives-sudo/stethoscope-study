import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import LandingGate from "./LandingGate.jsx";
import RenewalPage from "./RenewalPage.jsx";
import UserMenu from "./UserMenu.jsx";
import App from "./App.jsx";

const LOGO_PLACEHOLDER = null;

async function startCheckout(productType, userId, userEmail) {
  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productType, userId, userEmail }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  }
}

export default function AuthWrapper() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // After sign-in, check if user had a pending product selected before signing in
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const pending = sessionStorage.getItem("pendingProduct");
    if (pending) {
      sessionStorage.removeItem("pendingProduct");
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      startCheckout(pending, user.id, email);
    }
  }, [isSignedIn, user]);

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

  // No tier yet — check if we're waiting for a pending purchase
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

  // Valid access → show the app with user menu overlay
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "fixed",
        top: 12,
        right: 16,
        zIndex: 9999,
      }}>
        <UserMenu />
      </div>
      <App />
    </div>
  );
}
