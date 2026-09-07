import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  lead,
  children,
  className,
  id,
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto mt-20 max-w-7xl px-4", className)}>
      {eyebrow && (
        <p className="label-caps flex items-center gap-2 text-[10px] text-primary">
          <span className="h-px w-8 bg-primary/60" />
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="mt-4 max-w-3xl text-balance text-3xl leading-tight sm:text-5xl">{title}</h2>
      )}
      {lead && (
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
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
  return <div className={cn("glass-panel rounded-2xl p-6 sm:p-8", className)}>{children}</div>;
}
