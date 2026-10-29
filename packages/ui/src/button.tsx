import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `button button-${variant} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export function Button({ variant = "primary", loading = false, disabled, type = "button", className, children, ...props }: ButtonProps) {
  return (
    <button {...props} type={type} className={buttonClasses(variant, className)} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
