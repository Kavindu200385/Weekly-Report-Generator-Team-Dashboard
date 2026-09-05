import type { Role } from "@/types";
import { useUsers, useUpdateUserRole, useRemoveUser } from "@/hooks/useUsers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/Avatar";
import { Sm } from "@/components/ui/Sm";

export default function UserManagementPage() {
  const { data: users = [] } = useUsers();
  const updateRole = useUpdateUserRole();
  const removeUser = useRemoveUser();

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Team Members" sub="Manage user accounts and roles" />
      <div className="page-pad" style={{ padding: "16px 28px 0" }}>
        <div style={{ padding: "10px 14px", background: "var(--raised)", borderRadius: 10, fontSize: 12.5, color: "var(--text-2)" }}>
          New accounts are created via the Register page — there's no manager-invite flow yet. You can change roles or deactivate accounts below.
        </div>
      </div>
      <div className="page-pad" style={{ padding: "16px 28px 22px" }}>
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
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEE2E2", color: "#B91C1C", borderRadius: 10, fontSize: 13 }}>
            {updateRole.error instanceof Error ? updateRole.error.message : "Failed to update role."}
          </div>
        )}
      </div>
    </div>
  );
}
