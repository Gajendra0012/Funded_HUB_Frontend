import { PageHeading } from "@/components/ops-common";
import { SettingsScreen } from "@/components/settings-screen";

export default function Page() {
  return (
    <>
      <PageHeading title="Settings" section="Setup" description="Platform settings, saved one at a time. Each says whether anything uses it yet." />
      <SettingsScreen />
    </>
  );
}
