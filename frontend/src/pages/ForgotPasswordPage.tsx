import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRequestPasswordReset } from "@/hooks/usePasswordReset";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Btn } from "@/components/ui/Btn";

interface ForgotPasswordForm { email: string; }

export default function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    requestReset.mutate(data.email, {
      onSuccess: (res) => setSubmittedMessage(res.message),
    });
  };

  return (
    <AuthLayout mode="register">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 13, background: "var(--accent-bg)", marginBottom: 14 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/><rect x="12" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="2" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="12" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/></svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em" }}>Forgot your password?</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 5, fontWeight: 500 }}>
          Enter your email and your manager will be notified to reset it for you.
        </div>
      </div>

      {submittedMessage ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
          <div style={{ padding: "14px 16px", background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
            {submittedMessage}
          </div>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Email address</FieldLabel>
            <input className="inp" type="email" style={{ background: "var(--raised)" }} {...register("email", { required: true })} />
            {errors.email && <span style={{ fontSize: 11, color: "#B91C1C" }}>Email is required</span>}
          </div>
          <div style={{ marginTop: 8 }}>
            <Btn variant="primary" type="submit" disabled={requestReset.isPending}>
              {requestReset.isPending ? "Sending…" : "Notify my manager"}
            </Btn>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/login" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-3)", textDecoration: "none" }}>
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
