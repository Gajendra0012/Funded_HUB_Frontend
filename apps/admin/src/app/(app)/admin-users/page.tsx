import { AdminUsersScreen } from "@/components/admin-users-screen";
import { PageHeading } from "@/components/ops-common";
import { verifyAdminSession } from "@/lib/auth/session";

export default async function Page() {
  // Already checked by the layout for this request (cached): used here to mark the signed-in admin's row.
  const session = await verifyAdminSession();
  return (
    <>
      <PageHeading title="Admin users" section="People" description="Who can use the admin app, their roles and their 2FA." />
      <AdminUsersScreen currentProfileId={session.userId} />
    </>
  );
}
