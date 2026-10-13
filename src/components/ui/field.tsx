import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border-[1.5px] border-cream-300 bg-white px-4 text-[0.95rem] text-charcoal placeholder:text-ash/70 transition-colors hover:border-charcoal/30 focus:border-charcoal focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-saffron/40 aria-[invalid=true]:border-chili aria-[invalid=true]:ring-chili/15 disabled:opacity-60";

interface FieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  className?: string;
  optional?: boolean;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}

/** Wires a label, hint and error message to any control via render props. */
export function Field({ label, error, hint, className, optional, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ash">(optional)</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ash">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-chili-deep">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        control,
        "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23141414%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:12px] bg-[position:right_1rem_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    />
  );
});

export function Checkbox({
  label,
  description,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; description?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="peer mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-[1.5px] border-charcoal/40 bg-white transition-colors checked:border-chili checked:bg-chili checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223.5%22><path d=%22M5 12l5 5L20 7%22/></svg>')] checked:bg-[length:14px] checked:bg-center checked:bg-no-repeat"
        {...props}
      />
      <span className="text-sm leading-snug">
        <span className="font-medium">{label}</span>
        {description && <span className="block text-ash">{description}</span>}
      </span>
    </label>
  );
}
