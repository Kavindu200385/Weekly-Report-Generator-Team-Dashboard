import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Btn } from "@/components/ui/Btn";

interface RegisterForm { name: string; email: string; password: string; confirmPassword: string; }

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<RegisterForm>({
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    if (!recaptchaToken) return;
    setFormError(null);
    setSubmitting(true);
    try {
      // Note: registration always creates a "member" account — role is
      // never sent by the client and the backend ignores any role field.
      const user = await registerUser(data.name.trim(), data.email, data.password, recaptchaToken);
      navigate(user.role === "manager" ? "/dashboard" : "/my-report");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 13, background: "var(--accent-bg)", marginBottom: 14 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/><rect x="12" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="2" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="12" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/></svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em" }}>Create your account</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 5, fontWeight: 500 }}>Join your team on Sitrep</div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 22, padding: "4px", background: "var(--raised)", borderRadius: 12 }}>
        <Link to="/login" style={{ flex: 1, padding: "8px 0", background: "transparent", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: 500, color: "var(--text-3)", textAlign: "center", textDecoration: "none" }}>
          Sign in
        </Link>
        <button style={{ flex: 1, padding: "8px 0", background: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: 700, color: "var(--accent)", boxShadow: "0 1px 4px rgba(15,23,42,.08)" }}>
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input className="inp" style={{ background: "var(--raised)" }} {...register("name", { required: true, validate: (v) => v.trim().length > 0 })} placeholder="Your name" />
          {errors.name && <span style={{ fontSize: 11, color: "#B91C1C" }}>Name is required</span>}
        </div>
        <div>
          <FieldLabel>Email address</FieldLabel>
          <input className="inp" type="email" style={{ background: "var(--raised)" }} {...register("email", { required: true })} />
          {errors.email && <span style={{ fontSize: 11, color: "#B91C1C" }}>Email is required</span>}
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <input className="inp" type="password" style={{ background: "var(--raised)" }} {...register("password", { required: true, minLength: 8 })} />
          {errors.password && <span style={{ fontSize: 11, color: "#B91C1C" }}>Password must be at least 8 characters</span>}
        </div>
        <div>
          <FieldLabel>Confirm password</FieldLabel>
          <input className="inp" type="password" style={{ background: "var(--raised)" }} {...register("confirmPassword", { required: true, validate: (v) => v === password || "Passwords do not match" })} />
          {errors.confirmPassword && <span style={{ fontSize: 11, color: "#B91C1C" }}>{errors.confirmPassword.message || "Passwords must match"}</span>}
        </div>

        <div style={{ width: 304, height: 78, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            theme="light"
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
          />
        </div>

        {formError && <span style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>{formError}</span>}

        <div style={{ marginTop: 8 }}>
          <Btn variant="primary" type="submit" disabled={!isValid || !recaptchaToken || submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Btn>
        </div>
      </form>
    </AuthLayout>
  );
}
