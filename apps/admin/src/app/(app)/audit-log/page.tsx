import { AuditScreen } from "@/components/audit-screen";
import { PageHeading } from "@/components/ops-common";

export default function Page() {
  return (
    <>
      <PageHeading title="Audit log" section="System" description="Who changed what in the admin app, and when. Read only." />
      <AuditScreen />
    </>
  );
}
