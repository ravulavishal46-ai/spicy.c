import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "saffron" | "light" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-chili-strong text-white hover:bg-chili-deep shadow-[0_8px_20px_-10px_rgb(230_57_32/0.8)]",
  dark: "bg-charcoal text-cream hover:bg-charcoal-700",
  outline: "border-[1.5px] border-charcoal/85 text-charcoal hover:bg-charcoal hover:text-cream",
  ghost: "text-charcoal hover:bg-charcoal/[0.06]",
  saffron: "bg-saffron text-charcoal hover:bg-[#ffa726]",
  light: "bg-cream text-charcoal hover:bg-white",
  danger: "bg-white text-chili-deep border-[1.5px] border-chili/40 hover:bg-chili-deep hover:text-white hover:border-chili-deep",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-[0.95rem] rounded-full",
  lg: "h-14 px-7 text-base rounded-full",
  icon: "h-11 w-11 rounded-full",
  "icon-sm": "h-9 w-9 rounded-full",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, loading, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  );
});

type ButtonLinkProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
