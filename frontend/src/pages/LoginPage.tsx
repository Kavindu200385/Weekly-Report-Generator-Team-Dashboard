import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/context/AuthContext";
import { checkRecaptchaRequired } from "@/api/auth.api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Btn } from "@/components/ui/Btn";

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaRequired, setRecaptchaRequired] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const fillDemoAccount = (email: string) => {
    setValue("email", email);
    setValue("password", "Password123!");
  };

  const onSubmit = async (data: LoginForm) => {
    setFormError(null);

    // Normal logins never touch reCAPTCHA at all — only check once we
    // don't already know it's required, or once the user has a token ready.
    if (!recaptchaRequired) {
      const required = await checkRecaptchaRequired(data.email);
      if (required) {
        setRecaptchaRequired(true);
        setFormError("Too many failed attempts — please complete the check below and try again.");
        return;
      }
    } else if (!recaptchaToken) {
      // Widget is showing but not completed yet — nothing to submit.
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(data.email, data.password, recaptchaToken ?? undefined);
      navigate(user.role === "manager" ? "/dashboard" : "/my-report");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      // A fresh wrong-password attempt may have just crossed the threshold —
      // re-check so the widget appears for the next attempt if needed.
      const required = await checkRecaptchaRequired(data.email);
      setRecaptchaRequired(required);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 13, background: "var(--accent-bg)", marginBottom: 14 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/><rect x="12" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="2" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="12" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/></svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em" }}>Welcome back</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 5, fontWeight: 500 }}>Sign in to your Sitrep workspace</div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 22, padding: "4px", background: "var(--raised)", borderRadius: 12 }}>
        <button style={{ flex: 1, padding: "8px 0", background: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: 700, color: "var(--accent)", boxShadow: "0 1px 4px rgba(15,23,42,.08)" }}>
          Sign in
        </button>
        <Link to="/register" style={{ flex: 1, padding: "8px 0", background: "transparent", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: 500, color: "var(--text-3)", textAlign: "center", textDecoration: "none" }}>
          Create account
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Email address</FieldLabel>
          <input className="inp" type="email" style={{ background: "var(--raised)" }} {...register("email", { required: true })} />
          {errors.email && <span style={{ fontSize: 11, color: "#B91C1C" }}>Email is required</span>}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FieldLabel>Password</FieldLabel>
            <Link to="/forgot-password" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <input className="inp" type="password" style={{ background: "var(--raised)" }} {...register("password", { required: true })} />
        </div>

        {recaptchaRequired && (
          <div style={{ width: "100%", maxWidth: 304, height: 78, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              theme="light"
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
            />
          </div>
        )}

        {formError && <span style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>{formError}</span>}

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 8 }}>
          <Btn variant="primary" type="submit" disabled={(recaptchaRequired && !recaptchaToken) || submitting}>
            {submitting ? "Signing in…" : "Sign in to Sitrep"}
          </Btn>
        </div>
      </form>

      {import.meta.env.DEV && (
        <div style={{ marginTop: 22, padding: "12px 14px", background: "var(--raised)", borderRadius: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            Demo accounts (dev only)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Manager", email: "manager@sitrep.test" },
              { label: "Member", email: "member1@sitrep.test" },
            ].map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => fillDemoAccount(acct.email)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "4px 0", background: "none", border: "none", cursor: "pointer" }}
              >
                <span style={{ fontSize: 11.5, color: "var(--text-2)", fontFamily: "inherit" }}>{acct.email}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: acct.label === "Manager" ? "var(--accent)" : "var(--text-3)", background: acct.label === "Manager" ? "var(--accent-bg)" : "#fff", padding: "2px 8px", borderRadius: 10 }}>
                  {acct.label}
                </span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 8, lineHeight: 1.5 }}>
            Fills email/password (all seeded accounts use <code>Password123!</code>). reCAPTCHA only appears after 3 failed attempts.
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
