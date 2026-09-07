import { cn } from "@/lib/utils";

/**
 * A section reads like a shot: an eyebrow slate, a single headline in focus,
 * one line of supporting copy, then the content. Generous vertical air
 * (min 120px desktop) is part of the cinematic language — do not tighten it.
 */
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
    <section id={id} className={cn("mx-auto mt-28 max-w-6xl px-5 sm:mt-32", className)}>
      {eyebrow && (
        <p className="label-caps flex items-center gap-3 text-[10px] text-primary">
          <span className="h-px w-10 bg-primary/50" />
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="mt-5 max-w-3xl text-balance text-[1.75rem] leading-[1.25] sm:text-4xl">
          {title}
        </h2>
      )}
      {lead && (
        <p className="mt-5 max-w-2xl text-pretty text-[0.975rem] leading-[1.85] text-muted-foreground sm:text-base">
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
    <div
      className={cn(
        "panel rounded-md p-6 transition-colors duration-300 sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Machine readout strip: coordinates, timecodes, status. Pure atmosphere. */
export function Readout({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <p className={cn("readout flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {items.map((s, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && <span className="text-border">·</span>}
          {s}
        </span>
      ))}
    </p>
  );
}
