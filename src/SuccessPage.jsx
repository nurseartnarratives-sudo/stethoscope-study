import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const MESSAGES = {
  monthly: {
    icon: "🎉",
    title: "Welcome to Stethoscope Study!",
    body: "Your monthly access is now active. You can sign in and start studying right away!",
    showAppButton: true,
  },
  lifetime: {
    icon: "🏆",
    title: "Lifetime Access Unlocked!",
    body: "You have lifetime access to Stethoscope Study — no renewals, ever. Let's get studying!",
    showAppButton: true,
  },
  pdf: {
    icon: "📄",
    title: "Your Study Guide is on its way!",
    body: "Check your email — your HESI A2 & TEAS 7 Master Study Guide PDF has been sent. Don't forget to check your spam folder if you don't see it within a few minutes.",
    showAppButton: false,
  },
  bundle: {
    icon: "🎁",
    title: "Bundle Unlocked!",
    body: "Your lifetime app access is active AND your PDF Study Guide has been sent to your email. You're fully equipped — go ace that exam!",
    showAppButton: true,
  },
};

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(10);
  const params = new URLSearchParams(window.location.search);
  const product = params.get("product") || "monthly";
  const msg = MESSAGES[product] || MESSAGES.monthly;

  useEffect(() => {
    if (!msg.showAppButton) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [msg.showAppButton]);

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
        maxWidth: 500,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>{msg.icon}</div>

        <h1 style={{
          color: C.crimson,
          fontSize: 26,
          fontWeight: 800,
          marginBottom: 16,
        }}>
          {msg.title}
        </h1>

        <div style={{
          background: C.greenBg,
          border: `1px solid #639922`,
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          color: C.green,
          fontWeight: 600,
          fontSize: 15,
        }}>
          ✓ Payment confirmed
        </div>

        <p style={{
          color: C.gray,
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 28,
        }}>
          {msg.body}
        </p>

        {msg.showAppButton && (
          <>
            <a
              href="/"
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
              Go to the App →
            </a>
            <p style={{ color: C.gray, fontSize: 13, margin: 0 }}>
              Redirecting automatically in {countdown} seconds…
            </p>
          </>
        )}

        {!msg.showAppButton && (
          <a
            href="https://study.thenuttynurse.com"
            style={{
              display: "inline-block",
              background: C.crimson,
              color: C.white,
              padding: "12px 28px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Check out the Study App too →
          </a>
        )}

        <p style={{
          color: C.gray,
          fontSize: 12,
          marginTop: 24,
          borderTop: "1px solid #f0f0f0",
          paddingTop: 16,
        }}>
          Questions? Email <a href="mailto:nurse.artnarratives@gmail.com" style={{ color: C.crimson }}>nurse.artnarratives@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
