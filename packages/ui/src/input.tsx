import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ id, label, hint, error, className = "", "aria-describedby": describedBy, ...props }: InputProps) {
  const description = [describedBy, hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input {...props} id={id} className={`field ${className}`} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={description} />
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="field-error">{error}</p>}
    </div>
  );
}
