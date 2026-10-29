import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, Input } from "../../../packages/ui/src";

describe("shared control accessibility", () => {
  it("prevents repeat submissions while loading and preserves the button label", () => {
    const markup = renderToStaticMarkup(<Button type="submit" loading>Save changes</Button>);
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain("Save changes");
  });
  it("defaults to a non-submitting button and honors explicit disabling", () => {
    expect(renderToStaticMarkup(<Button>Open</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button disabled>Save</Button>)).toContain('disabled=""');
  });
  it("associates labels, hints, errors, and caller descriptions with their input", () => {
    const markup = renderToStaticMarkup(<Input id="email" label="Email" hint="Use your email" error="Invalid email" aria-describedby="external-help" />);
    expect(markup).toContain('for="email"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="external-help email-hint email-error"');
    expect(markup).toContain('id="email-error" role="alert"');
  });
  it("does not announce an error for a valid field", () => {
    const markup = renderToStaticMarkup(<Input id="name" label="Name" />);
    expect(markup).not.toContain("aria-invalid");
    expect(markup).not.toContain("aria-describedby");
  });
});
