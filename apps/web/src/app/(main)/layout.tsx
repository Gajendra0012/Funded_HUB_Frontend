import type { Viewport } from "next";
import "../theme.css";
import { Providers } from "@/components/Providers";
import { buildPaletteCss, buildPaletteScript } from "@/config/brand";

export const viewport: Viewport = { themeColor: "#05070D", colorScheme: "dark" };

/**
 * Layout for the whole product (everything except the design-system page):
 *  - theme.css: the dark theme, effects and animations;
 *  - the colour palette (Demo Controls can switch it; the choice is saved in the browser);
 *  - Providers: demo data store, toasts, wallet pop-up and the Demo Controls button.
 */
export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildPaletteCss() }} />
      {/* Applies the saved palette before the page shows, so the colours never flash. */}
      <script dangerouslySetInnerHTML={{ __html: buildPaletteScript() }} />
      <div className="grain">
        <Providers>{children}</Providers>
      </div>
    </>
  );
}
