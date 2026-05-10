import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import LandingGate from "./LandingGate.jsx";
import RenewalPage from "./RenewalPage.jsx";
import UserMenu from "./UserMenu.jsx";
import App from "./App.jsx";

const LOGO_PLACEHOLDER = null;

export default function AuthWrapper() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [activating, setActivating] = useState(false);

  // After sign-in, check if there's a pending purchase to activate
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const pendingSessionId = localStorage.getItem("pendingSessionId");
    if (!pendingSessionId) return;

    // Clear immediately so we don't retry
    localStorage.removeItem("pendingSessionId");
    localStorage.removeItem("pendingProduct");

    setActivating(true);

    fetch("/api/verify-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: pendingSessionId,
        userId: user.id,
        userEmail: user.emailAddresses?.[0]?.emailAddress || "",
      }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success) {
          console.log("✅ Access activated:", data.accessTier);
          await user.reload(); // Refresh Clerk metadata
        } else {
          console.error("Verify purchase failed:", data.error);
        }
        setActivating(false);
      })
      .catch((err) => {
        console.error("Verify purchase error:", err);
        setActivating(false);
      });
  }, [isLoaded, isSignedIn, user]);

  // Loading state
  if (!isLoaded || activating) {
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
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {activating ? "Activating your access…" : "Loading Stethoscope Study…"}
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return <LandingGate logoSrc={LOGO_PLACEHOLDER} />;
  }

  const tier = user?.publicMetadata?.access_tier;

  // No tier yet
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
          Your account was created but access hasn't been activated yet.
          If you just purchased, please wait a moment and refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#8B0000",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 8,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Refresh
        </button>
        <a
          href="mailto:nurse.artnarratives@gmail.com"
          style={{ color: "#8B0000", fontSize: 14, fontWeight: 600 }}
        >
          Contact Support
        </a>
      </div>
    );
  }

  // Expired monthly
  if (tier === "monthly_expired") {
    return <RenewalPage logoSrc={LOGO_PLACEHOLDER} />;
  }

  // Valid access
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "fixed", top: 12, right: 16, zIndex: 9999 }}>
        <UserMenu />
      </div>
      <App />
    </div>
  );
}
