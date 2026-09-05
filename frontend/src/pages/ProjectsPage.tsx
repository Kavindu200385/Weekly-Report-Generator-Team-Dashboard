import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ApiProject } from "@/api/projects.api";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Btn } from "@/components/ui/Btn";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Modal } from "@/components/ui/Modal";

interface ProjectForm { name: string; description: string; }

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20,
      background: isActive ? "#D1FAE5" : "#F1F5F9", color: isActive ? "#065F46" : "#64748B",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#10B981" : "#94A3B8", flexShrink: 0 }} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function ProjectsPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: projects = [], isLoading } = useProjects(includeInactive);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProject | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectForm>({
    defaultValues: { name: "", description: "" },
  });

  const openAdd = () => { reset({ name: "", description: "" }); setEditing(null); setFormError(null); setModalOpen(true); };
  const openEdit = (p: ApiProject) => { reset({ name: p.name, description: p.description ?? "" }); setEditing(p); setFormError(null); setModalOpen(true); };

  const onSubmit = (data: ProjectForm) => {
    setFormError(null);
    const payload = { name: data.name, description: data.description || undefined };
    const onError = (err: unknown) => setFormError(err instanceof Error ? err.message : "Something went wrong.");
    if (editing) {
      updateProject.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModalOpen(false), onError });
    } else {
      createProject.mutate(payload, { onSuccess: () => setModalOpen(false), onError });
    }
  };

  const confirmDelete = () => {
    if (confirmDeleteId === null) return;
    deleteProject.mutate(confirmDeleteId, {
      onSuccess: (res) => {
        setConfirmDeleteId(null);
        if (res.activeReportsAffected > 0) {
          setArchiveNotice(
            `${res.activeReportsAffected} active report${res.activeReportsAffected !== 1 ? "s" : ""} use this project. It has been archived, not deleted, and those reports will keep their project reference.`,
          );
        }
      },
      onError: () => setConfirmDeleteId(null),
    });
  };

  const reactivate = (p: ApiProject) => updateProject.mutate({ id: p.id, isActive: true });

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <PageHeader
        title="Projects"
        sub="Manage work categories"
        action={<Btn variant="primary" onClick={openAdd}>+ Add project</Btn>}
      />

      {archiveNotice && (
        <div style={{ margin: "16px 28px 0", padding: "12px 16px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#78350F" }}>{archiveNotice}</span>
          <button onClick={() => setArchiveNotice(null)} style={{ background: "none", border: "none", color: "#92400E", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div className="page-pad" style={{ padding: "16px 28px 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text-2)", minHeight: 44 }}>
          <input type="checkbox" checked={includeInactive} onChange={e => setIncludeInactive(e.target.checked)} style={{ accentColor: "var(--accent)", width: 18, height: 18 }} />
          Show inactive projects
        </label>
      </div>

      <div className="page-pad" style={{ padding: "16px 28px 22px" }}>
        <Panel>
          <div className="table-wrap">
          <table className="dt">
            <thead><tr><th>Project name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ opacity: p.isActive ? 1 : 0.55 }}>
                  <td data-label="Project">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6h13v7.5a1 1 0 01-1 1h-11a1 1 0 01-1-1V6z"/><path d="M1.5 6l1.5-3h3.5l1 2.5"/></svg>
                      </div>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                    </div>
                  </td>
                  <td data-label="Description" style={{ color: "var(--text-2)" }}>{p.description || <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                  <td data-label="Status"><StatusPill isActive={p.isActive} /></td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 12 }}>
                      {p.isActive ? (
                        <>
                          <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>Edit</button>
                          <button onClick={() => setConfirmDeleteId(p.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600, padding: 0 }}>Archive</button>
                        </>
                      ) : (
                        <button onClick={() => reactivate(p)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>Reactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && projects.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>No projects yet.</td></tr>}
            </tbody>
          </table>
          </div>
        </Panel>
      </div>

      {modalOpen && (
        <Modal title={editing ? "Edit project" : "New project"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <FieldLabel>Project name</FieldLabel>
              <input className="inp" {...register("name", { required: true })} placeholder="e.g. Horizon Platform" />
              {errors.name && <span style={{ fontSize: 11, color: "#B91C1C" }}>Name is required</span>}
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <input className="inp" {...register("description")} placeholder="Brief description" />
            </div>
            {formError && <span style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600 }}>{formError}</span>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>
              <Btn variant="primary" type="submit">{editing ? "Save changes" : "Create project"}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {confirmDeleteId !== null && (
        <Modal title="Archive project" onClose={() => setConfirmDeleteId(null)}>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
            This project will be archived (not permanently deleted) and hidden from the active list.
            Any existing reports will keep their reference to it. You can reactivate it later.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, marginTop: 16, borderTop: "1px solid var(--border)" }}>
            <Btn variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={confirmDelete}>Archive project</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
