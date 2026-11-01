import { notFound, redirect } from "next/navigation";
import AuthForm, { PortalRole } from "../../../components/auth-form";

const validRoles = ["student", "teacher", "examiner"] as const;

export default async function RoleSignupPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role === "admin") redirect("/admin/login");
  if (!validRoles.includes(role as (typeof validRoles)[number])) notFound();
  return <AuthForm mode="signup" role={role as PortalRole} />;
}
