import { useEffect } from "react";
import { useAuth, SignIn } from "@clerk/clerk-react";

const C = {
  crimson: "#8B0000",
  gold: "#D4A017",
  cream: "#FFF8E7",
  dark: "#1a1a1a",
  gray: "#555",
  white: "#fff",
  green: "#27500A",
  greenBg: "#EAF3DE",
};

const PRODUCT_LABELS = {
  monthly: "Monthly Access",
  lifetime: "Lifetime Access",
  pdf: "PDF Study Guide",
  bundle: "Lifetime Bundle — App Access + PDF Study Guide",
};

export default function SuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const product = params.get("product") || "monthly";
  const isPdfOnly = product === "pdf";

  const { isLoaded, isSignedIn } = useAuth();

  // Save session to localStorage so AuthWrapper can grant access after sign-in
  useEffect(() => {
    if (sessionId && !isPdfOnly) {
      localStorage.setItem("pendingSessionId", sessionId);
      localStorage.setItem("pendingProduct", product);
    }
  }, [sessionId, product, isPdfOnly]);

  // If already signed in, redirect to app — AuthWrapper will handle verify-purchase
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPdfOnly) {
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn, isPdfOnly]);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.cream} 0%, #fff 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: C.white,
        border: `2px solid ${C.gold}`,
        borderRadius: 16,
        padding: "48px 40px",
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <h1 style={{ color: C.crimson, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Payment Confirmed!
        </h1>
        <div style={{
          background: C.greenBg,
          border: "1px solid #639922",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 24,
          color: C.green,
          fontWeight: 600,
          fontSize: 14,
        }}>
          ✓ {PRODUCT_LABELS[product] || "Purchase"} — payment received
        </div>

        {/* PDF only */}
        {isPdfOnly && (
          <div>
            <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7 }}>
              Your <strong>HESI A2 &amp; TEAS 7 Master Study Guide</strong> has been
              sent to your email. Check your inbox (and spam folder just in case)!
            </p>
            <p style={{ marginTop: 16, color: C.gray, fontSize: 14 }}>
              Want interactive study tools too?{" "}
              <a href="/" style={{ color: C.crimson, fontWeight: 600 }}>
                Check out the app →
              </a>
            </p>
          </div>
        )}

        {/* App access products — prompt sign in/up */}
        {!isPdfOnly && isLoaded && !isSignedIn && (
          <div>
            <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
              <strong>One last step!</strong> Create your free account to activate
              your access. Use the <strong>same email</strong> you used at checkout.
            </p>
            <div style={{ transform: "scale(0.92)", transformOrigin: "top center" }}>
              <SignIn
                routing="hash"
                afterSignInUrl="/"
                afterSignUpUrl="/"
              />
            </div>
          </div>
        )}

        {/* Already signed in — redirecting */}
        {!isPdfOnly && isLoaded && isSignedIn && (
          <div>
            <p style={{ color: C.gray, fontSize: 15 }}>
              Activating your access…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
