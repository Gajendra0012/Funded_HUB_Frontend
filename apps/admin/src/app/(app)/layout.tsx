import { AdminShell } from "@/components/admin-shell";
import { PreviewProvider } from "@/components/preview-provider";
import { assertAdminEnv, environmentLabel } from "@/config/env";
import { verifyAdminSession } from "@/lib/auth/session";
import { initialState, roles, countryOptions, currentPreviewUser, permissionMatrix, descriptions } from "@/mocks/legacy";
import { navigation } from "@/mocks/admin";
import { SAMPLE_NOW } from "@/mocks/now";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Page protection, second layer (after src/proxy.ts): only an active admin session
  // (password + 2FA code, under 12 hours) gets past this line. Everyone else goes to /login.
  const session = await verifyAdminSession();

  const identity = {
    name: session.name,
    email: session.email,
    initials: session.initials,
    environment: environmentLabel(assertAdminEnv().adminApiUrl),
    sessionExpiresAt: session.expiresAtMs,
    // The pages still show sample data, so the top-bar clock stays on the sample time.
    now: SAMPLE_NOW,
  };

  return (
    <PreviewProvider data={initialState} config={{ roles, countryOptions, currentPreviewUser, permissionMatrix, descriptions }}>
      <AdminShell navigation={navigation} identity={identity} showDev={process.env.NODE_ENV === "development"}>
        {children}
      </AdminShell>
    </PreviewProvider>
  );
}
