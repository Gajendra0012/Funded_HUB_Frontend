import { AdminShell } from "@/components/admin-shell";
import { PreviewProvider } from "@/components/preview-provider";
import { initialState, roles, countryOptions, currentPreviewUser, permissionMatrix, descriptions } from "@/mocks/legacy";
import { identity, navigation } from "@/mocks/admin";
export default function AppLayout({children}:{children:React.ReactNode}) {return <PreviewProvider data={initialState} config={{roles,countryOptions,currentPreviewUser,permissionMatrix,descriptions}}><AdminShell navigation={navigation} identity={identity} showDev={process.env.NODE_ENV==="development"}>{children}</AdminShell></PreviewProvider>;}
