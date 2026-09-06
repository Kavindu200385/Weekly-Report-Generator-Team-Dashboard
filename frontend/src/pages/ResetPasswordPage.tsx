import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useValidateResetToken, useSubmitNewPassword } from "@/hooks/usePasswordReset";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Btn } from "@/components/ui/Btn";

interface ResetForm { password: string; confirmPassword: string; }

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { isLoading: tokenLoading, isError: tokenInvalid } = useValidateResetToken(token);
  const submitNewPassword = useSubmitNewPassword();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = watch("password");

  const onSubmit = (data: ResetForm) => {
    if (!token) return;
    setFormError(null);
    submitNewPassword.mutate({ token, newPassword: data.password }, {
      onSuccess: () => navigate("/login"),
      onError: (err) => setFormError(err instanceof Error ? err.message : "Failed to reset password."),
    });
  };

  return (
    <AuthLayout mode="register">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 13, background: "var(--accent-bg)", marginBottom: 14 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/><rect x="12" y="2" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="2" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".42"/><rect x="12" y="12" width="8" height="8" rx="2" fill="var(--accent)" opacity=".9"/></svg>
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em" }}>Set a new password</div>
      </div>

      {!token || tokenInvalid ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
          <div style={{ padding: "14px 16px", background: "#FEE2E2", color: "#B91C1C", borderRadius: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
            This reset link is invalid or has expired.
          </div>
          <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
            Request a new link
          </Link>
        </div>
      ) : tokenLoading ? (
        <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Checking link…</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel>New password</FieldLabel>
            <input className="inp" type="password" style={{ background: "var(--raised)" }} {...register("password", { required: true, minLength: 8 })} />
            {errors.password && <span style={{ fontSize: 11, color: "#B91C1C" }}>Password must be at least 8 characters</span>}
          </div>
          <div>
            <FieldLabel>Confirm new password</FieldLabel>
            <input className="inp" type="password" style={{ background: "var(--raised)" }} {...register("confirmPassword", { required: true, validate: (v) => v === password || "Passwords do not match" })} />
            {errors.confirmPassword && <span style={{ fontSize: 11, color: "#B91C1C" }}>{errors.confirmPassword.message || "Passwords must match"}</span>}
          </div>
          {formError && <span style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>{formError}</span>}
          <div style={{ marginTop: 8 }}>
            <Btn variant="primary" type="submit" disabled={submitNewPassword.isPending}>
              {submitNewPassword.isPending ? "Saving…" : "Set new password"}
            </Btn>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
