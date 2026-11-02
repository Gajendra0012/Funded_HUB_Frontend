import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow,transform,filter] duration-200";

const variants: Record<Variant, string> = {
  // Gradient button with a light sweep (see .btn-primary in theme.css).
  primary: "btn-primary",
  secondary: "border border-line-strong bg-white/[0.04] text-fg hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]",
  ghost: "text-muted hover:bg-white/[0.05] hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

type Props = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** With `href` the button is a link: "/challenges" opens a page, "#faq" scrolls to a section. */
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/** The page's button. Renders a link when `href` is given, otherwise a <button>. */
export function Button({ variant = "primary", size = "md", className, children, iconLeft, iconRight, href, type = "button", ...rest }: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href !== undefined) {
    const content = (
      <>
        {iconLeft}
        {children}
        {iconRight}
      </>
    );
    // Other pages go through Next.js <Link> (no full reload); "#section" links stay plain.
    return href.startsWith("/") ? (
      <Link href={href} className={classes}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
