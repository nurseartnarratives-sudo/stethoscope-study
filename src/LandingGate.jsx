import { SignInButton, useClerk } from "@clerk/clerk-react";

const C = {
  crimson: "#8B0000",
  crimsonLight: "#B22222",
  gold: "#D4A017",
  goldLight: "#F0C030",
  cream: "#FFF8E7",
  dark: "#1a1a1a",
  gray: "#555",
  white: "#fff",
};

// ── Pricing data ────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "monthly",
    label: "Monthly Access",
    price: "$4.99",
    period: "/month",
    features: ["Full app access", "All study modules", "Cancel anytime"],
    highlight: false,
    cta: "Get Monthly Access",
  },
  {
    id: "lifetime",
    label: "Lifetime Access",
    price: "$17.99",
    period: "one-time",
    features: ["Full app access", "All study modules", "Free future updates", "Never expires"],
    highlight: true,
    cta: "Get Lifetime Access",
  },
  {
    id: "bundle",
    label: "Bundle",
    price: "$24.99",
    period: "one-time",
    features: ["Everything in Lifetime", "Bonus PDF Study Guide", "Never expires"],
    highlight: false,
    cta: "Get the Bundle",
  },
];

// Replace this URL with your actual Beacons store link
const BEACONS_URL = "https://beacons.ai/YOUR_STORE_LINK";

export default function LandingGate({ logoSrc }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.cream} 0%, #fff 60%, #FFF5F5 100%)`,
      fontFamily: "'Segoe UI', sans-serif",
      color: C.dark,
    }}>

      {/* ── Header ── */}
      <header style={{
        background: C.crimson,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoSrc && (
            <img src={logoSrc} alt="Nutty Nurse Logo" style={{ height: 44, borderRadius: 8 }} />
          )}
          <span style={{ color: C.gold, fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
            Stethoscope Study
          </span>
        </div>
        <SignInButton mode="modal">
          <button style={{
            background: "transparent",
            border: `2px solid ${C.gold}`,
            color: C.gold,
            padding: "8px 20px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}>
            Sign In
          </button>
        </SignInButton>
      </header>

      {/* ── Hero ── */}
      <section style={{
        textAlign: "center",
        padding: "60px 24px 40px",
        maxWidth: 700,
        margin: "0 auto",
      }}>
        {logoSrc && (
          <img src={logoSrc} alt="Nutty Nurse" style={{
            height: 110,
            marginBottom: 24,
            filter: "drop-shadow(0 4px 12px rgba(139,0,0,0.25))",
          }} />
        )}
        <h1 style={{
          fontSize: "clamp(26px, 5vw, 40px)",
          fontWeight: 800,
          color: C.crimson,
          marginBottom: 12,
          lineHeight: 1.2,
        }}>
          Stethoscope Study
        </h1>
        <p style={{
          fontSize: "clamp(16px, 2.5vw, 20px)",
          color: C.gray,
          marginBottom: 8,
          fontWeight: 500,
        }}>
          HESI A²&nbsp;&amp;&nbsp;TEAS 7 Prep
        </p>
        <p style={{
          fontSize: 15,
          color: C.gray,
          marginBottom: 36,
          maxWidth: 480,
          margin: "0 auto 36px",
        }}>
          Master the anatomy of sound with interactive study tools built by a nurse, for nurses.
        </p>

        <SignInButton mode="modal">
          <button style={{
            background: C.crimson,
            color: C.white,
            border: "none",
            padding: "14px 36px",
            borderRadius: 8,
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 4px 14px rgba(139,0,0,0.4)`,
            letterSpacing: 0.3,
          }}>
            Sign In to Access Your Study App
          </button>
        </SignInButton>
      </section>

      {/* ── Divider ── */}
      <div style={{
        textAlign: "center",
        padding: "32px 24px 8px",
        color: C.crimson,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: 0.5,
      }}>
        Choose Your Access Plan
      </div>
      <div style={{
        width: 60,
        height: 3,
        background: C.gold,
        margin: "8px auto 32px",
        borderRadius: 2,
      }} />

      {/* ── Pricing Cards ── */}
      <section style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 24,
        padding: "0 24px 60px",
        maxWidth: 1000,
        margin: "0 auto",
      }}>
        {TIERS.map((tier) => (
          <div key={tier.id} style={{
            background: tier.highlight ? C.crimson : C.white,
            color: tier.highlight ? C.white : C.dark,
            border: tier.highlight ? `3px solid ${C.gold}` : `2px solid #e0e0e0`,
            borderRadius: 14,
            padding: "32px 28px",
            width: 260,
            minWidth: 220,
            textAlign: "center",
            boxShadow: tier.highlight
              ? `0 8px 30px rgba(139,0,0,0.35)`
              : `0 2px 12px rgba(0,0,0,0.08)`,
            position: "relative",
            flex: "1 1 220px",
          }}>
            {tier.highlight && (
              <div style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                background: C.gold,
                color: C.dark,
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 16px",
                borderRadius: 20,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}>
                MOST POPULAR
              </div>
            )}

            <h3 style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 12,
              color: tier.highlight ? C.gold : C.crimson,
            }}>
              {tier.label}
            </h3>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 38, fontWeight: 800 }}>{tier.price}</span>
              <span style={{
                fontSize: 14,
                opacity: 0.75,
                marginLeft: 4,
              }}>{tier.period}</span>
            </div>

            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 24px",
              textAlign: "left",
            }}>
              {tier.features.map((f, i) => (
                <li key={i} style={{
                  padding: "5px 0",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: 0.9,
                }}>
                  <span style={{ color: tier.highlight ? C.goldLight : C.gold, fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={BEACONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: tier.highlight ? C.gold : C.crimson,
                color: tier.highlight ? C.dark : C.white,
                padding: "12px 0",
                borderRadius: 7,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                letterSpacing: 0.3,
              }}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: "center",
        padding: "20px 24px",
        borderTop: "1px solid #e0e0e0",
        fontSize: 13,
        color: C.gray,
        background: "#fafafa",
      }}>
        © {new Date().getFullYear()} Nutty Nurse · Stethoscope Study App
      </footer>
    </div>
  );
}
