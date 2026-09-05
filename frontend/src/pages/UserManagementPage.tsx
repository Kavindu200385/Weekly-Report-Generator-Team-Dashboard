import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Role } from "@/types";
import { useUsers, useUpdateUserRole, useRemoveUser } from "@/hooks/useUsers";
import { usePendingInvites, useCreateInvite, useRevokeInvite } from "@/hooks/useInvites";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PH } from "@/components/ui/Panel";
import { Btn } from "@/components/ui/Btn";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Sm } from "@/components/ui/Sm";

interface InviteForm { email: string; role: Role; }

export default function UserManagementPage() {
  const { data: users = [] } = useUsers();
  const { data: invites = [] } = usePendingInvites();
  const updateRole = useUpdateUserRole();
  const removeUser = useRemoveUser();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();

  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    defaultValues: { email: "", role: "member" },
  });

  const openInvite = () => { reset({ email: "", role: "member" }); setInviteLink(null); setFormError(null); setModalOpen(true); };
  const closeInvite = () => { setModalOpen(false); setInviteLink(null); };

  const onSubmit = (data: InviteForm) => {
    setFormError(null);
    createInvite.mutate(data, {
      onSuccess: (invite) => setInviteLink(`${window.location.origin}/register?invite=${invite.token}`),
      onError: (err) => setFormError(err instanceof Error ? err.message : "Failed to create invite."),
    });
  };

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Team Members" sub="Manage user accounts and roles" action={<Btn variant="primary" onClick={openInvite}>+ Invite member</Btn>} />
      <div className="page-pad" style={{ padding: "16px 28px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Panel>
          <div className="table-wrap">
          <table className="dt">
            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                  <td data-label="Member">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar userId={String(u.id)} initials={u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)} size={32} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, textTransform: "capitalize" }}>{u.role}{!u.isActive && " · inactive"}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Email" style={{ color: "var(--text-2)" }}>{u.email}</td>
                  <td data-label="Role">
                    <select className="sel" value={u.role} onChange={e => updateRole.mutate({ id: u.id, role: e.target.value as Role })} style={{ minHeight: 36 }}>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                    </select>
                  </td>
                  <td data-label="Joined"><Sm muted>{u.createdAt.slice(0, 10)}</Sm></td>
                  <td data-label="Actions">
                    {u.isActive && (
                      <button onClick={() => removeUser.mutate(u.id)} style={{ background: "#FEE2E2", border: "none", color: "#B91C1C", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", padding: "5px 12px", minHeight: 32, borderRadius: 8 }}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Panel>
        {updateRole.isError && (
          <div style={{ padding: "10px 14px", background: "#FEE2E2", color: "#B91C1C", borderRadius: 10, fontSize: 13 }}>
            {updateRole.error instanceof Error ? updateRole.error.message : "Failed to update role."}
          </div>
        )}

        <Panel>
          <PH>Pending invites</PH>
          <div className="table-wrap">
          <table className="dt">
            <thead><tr><th>Email</th><th>Role</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id}>
                  <td data-label="Email">{inv.email}</td>
                  <td data-label="Role" style={{ textTransform: "capitalize" }}>{inv.role}</td>
                  <td data-label="Expires"><Sm muted>{inv.expiresAt.slice(0, 10)}</Sm></td>
                  <td data-label=""><button onClick={() => revokeInvite.mutate(inv.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600, padding: 0 }}>Revoke</button></td>
                </tr>
              ))}
              {invites.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text-3)" }}>No pending invites.</td></tr>}
            </tbody>
          </table>
          </div>
        </Panel>
      </div>

      {modalOpen && (
        <Modal title="Invite team member" onClose={closeInvite}>
          {inviteLink ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                Share this link with the invitee — it pre-fills their email and assigns them the selected role when they register. It expires in 7 days.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="inp" readOnly value={inviteLink} style={{ flex: 1, fontSize: 12 }} onFocus={e => e.target.select()} />
                <Btn variant="ghost" onClick={copyLink}>{copied ? "Copied ✓" : "Copy link"}</Btn>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <Btn variant="primary" onClick={closeInvite}>Done</Btn>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <FieldLabel>Email address</FieldLabel>
                <input className="inp" type="email" {...register("email", { required: true })} placeholder="name@company.com" />
                {errors.email && <span style={{ fontSize: 11, color: "#B91C1C" }}>Email is required</span>}
              </div>
              <div>
                <FieldLabel>Role</FieldLabel>
                <select className="sel" style={{ width: "100%" }} {...register("role", { required: true })}>
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              {formError && <span style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>{formError}</span>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <Btn variant="ghost" onClick={closeInvite}>Cancel</Btn>
                <Btn variant="primary" type="submit" disabled={createInvite.isPending}>{createInvite.isPending ? "Creating…" : "Create invite"}</Btn>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
