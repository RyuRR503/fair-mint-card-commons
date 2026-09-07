import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  lead,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto mt-20 max-w-7xl px-4", className)}>
      {eyebrow && (
        <p className="label-caps text-[11px] text-primary-foreground/80">
          <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
            {eyebrow}
          </span>
        </p>
      )}
      {title && (
        <h2 className="mt-4 max-w-3xl text-balance text-3xl leading-tight sm:text-5xl">
          {title}
        </h2>
      )}
      {lead && (
        <p className="mt-4 max-w-2xl text-pretty text-base text-foreground/70 sm:text-lg">
          {lead}
        </p>
      )}
      {children}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-[2rem] p-6 sm:p-8", className)}>{children}</div>
  );
}
