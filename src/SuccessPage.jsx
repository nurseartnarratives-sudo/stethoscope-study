import { useEffect, useState } from "react";
import { useUser, useAuth, SignIn } from "@clerk/clerk-react";

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

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [status, setStatus] = useState("idle"); // idle | verifying | granted | pdf_only | error
  const isPdfOnly = product === "pdf"; // bundle is NOT pdf-only — it includes app access too

  // Once signed in, verify the purchase and grant access
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !sessionId) return;
    if (status !== "idle") return;

    setStatus("verifying");

    fetch("/api/verify-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userId: user.id,
        userEmail: user.emailAddresses?.[0]?.emailAddress || "",
      }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success) {
          setStatus(data.accessTier ? "granted" : "pdf_only");
          if (data.accessTier) {
            // Reload Clerk user so metadata is fresh before redirecting
            await user.reload();
            setTimeout(() => { window.location.href = "/"; }, 2000);
          }
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [isLoaded, isSignedIn, user, sessionId, status]);

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

        {/* Payment confirmed banner — always show */}
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

        {/* PDF only — no sign in needed */}
        {isPdfOnly && (
          <div>
            <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7 }}>
              Your <strong>HESI A2 &amp; TEAS 7 Master Study Guide</strong> has been sent
              to your email. Check your inbox (and spam folder just in case)!
            </p>
            <p style={{ marginTop: 16, color: C.gray, fontSize: 14 }}>
              Want interactive study tools too?{" "}
              <a href="/" style={{ color: C.crimson, fontWeight: 600 }}>
                Check out the app →
              </a>
            </p>
          </div>
        )}

        {/* Bundle — PDF sent + app access coming */}
        {product === "bundle" && !isPdfOnly && isSignedIn && status === "idle" && (
          <div style={{
            background: "#FFF8E7",
            border: "1px solid #D4A017",
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 20,
            color: C.gray,
            fontSize: 14,
            textAlign: "left",
          }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700, color: C.crimson }}>🎁 Your Bundle includes:</p>
            <p style={{ margin: "4px 0" }}>📄 PDF Study Guide — sent to your email</p>
            <p style={{ margin: "4px 0" }}>🩺 Lifetime App Access — activating now…</p>
          </div>
        )}

        {/* Access products — need to sign in */}
        {!isPdfOnly && (
          <>
            {/* Not yet signed in — show sign in */}
            {isLoaded && !isSignedIn && (
              <div>
                <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                  <strong>One last step</strong> — create your account or sign in to
                  activate your access. Use the <strong>same email</strong> you used at checkout.
                </p>
                <div style={{ transform: "scale(0.92)", transformOrigin: "top center" }}>
                  <SignIn
                    routing="hash"
                    afterSignInUrl={window.location.href}
                    afterSignUpUrl={window.location.href}
                  />
                </div>
              </div>
            )}

            {/* Verifying purchase */}
            {isSignedIn && status === "verifying" && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: C.gray, fontSize: 15 }}>Activating your access…</p>
              </div>
            )}

            {/* Access granted */}
            {status === "granted" && (
              <div>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div>
                <h2 style={{ color: C.green, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                  Access Activated!
                </h2>
                <p style={{ color: C.gray, fontSize: 15, marginBottom: 20 }}>
                  You're all set! Redirecting you to the app in a moment…
                </p>
                <a href="/" style={{
                  display: "inline-block",
                  background: C.crimson,
                  color: C.white,
                  padding: "12px 32px",
                  borderRadius: 8,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 15,
                }}>
                  Go to App Now →
                </a>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div>
                <p style={{ color: C.crimson, fontSize: 15, marginBottom: 12 }}>
                  Something went wrong activating your access.
                </p>
                <p style={{ color: C.gray, fontSize: 14 }}>
                  Please email{" "}
                  <a href="mailto:nurse.artnarratives@gmail.com" style={{ color: C.crimson }}>
                    nurse.artnarratives@gmail.com
                  </a>{" "}
                  and we'll sort it out right away!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
