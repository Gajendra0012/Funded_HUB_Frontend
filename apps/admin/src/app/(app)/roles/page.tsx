import { PageHeading } from "@/components/ops-common";
import { RolesScreen } from "@/components/roles-screen";

export default function Page() {
  return (
    <>
      <PageHeading title="Roles" section="People" description="The admin roles and what each one may do. Set by the backend, read only." />
      <RolesScreen />
    </>
  );
}
