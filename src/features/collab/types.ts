export type OrgRole = "owner" | "admin" | "member";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  is_personal: boolean;
  created_at: string;
  role: OrgRole;
};

export type Member = {
  user_id: string;
  role: OrgRole;
  joined_at: string;
  full_name: string | null;
  business_name: string | null;
};

export type Invite = {
  id: string;
  email: string;
  role: OrgRole;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  token: string;
};

export type Comment = {
  id: string;
  org_id: string;
  subject_type: string;
  subject_id: string;
  author_id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

export type Task = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  assigner_id: string;
  assigner_name: string | null;
  subject_type: string | null;
  subject_id: string | null;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
  created_at: string;
};

export type ApprovalRequest = {
  id: string;
  org_id: string;
  requester_id: string;
  requester_name: string | null;
  title: string;
  rationale: string | null;
  subject_type: string | null;
  subject_id: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
};

export type ActivityEvent = {
  id: string;
  actor_id: string;
  actor_name: string | null;
  verb: string;
  subject_type: string | null;
  subject_id: string | null;
  summary: string;
  created_at: string;
};

export const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function canAdmin(role: OrgRole | undefined | null): boolean {
  return role === "owner" || role === "admin";
}
