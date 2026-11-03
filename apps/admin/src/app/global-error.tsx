"use client";

// global-error replaces the root layout, so it brings its own document and styles.
import "./globals.css";

/** Last-resort screen when the root layout itself crashes (ADM-06). No error details are shown. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="admin-theme">
        <title>Something went wrong | Funded HUB Admin</title>
        <main className="login-stage">
          <section className="login-card" role="alert" data-testid="global-error">
            <h1>Something went wrong.</h1>
            <p>
              Try again. If it keeps happening, tell the tech team
              {error.digest ? (
                <>
                  {" "}
                  and quote this reference: <code>{error.digest}</code>
                </>
              ) : null}
              .
            </p>
            <button type="button" className="ui-primary" onClick={() => retry()}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
