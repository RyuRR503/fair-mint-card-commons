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
  index,
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  /** Survey-sheet plate number, e.g. "03" */
  index?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto mt-32 max-w-6xl px-5 sm:mt-40", className)}>
      {(eyebrow || index) && (
        <div className="flex items-center gap-4">
          <span className="h-0.5 w-10 bg-primary" />
          {eyebrow && <p className="label-caps text-[10px] text-primary">{eyebrow}</p>}
        </div>
      )}
      {title && (
        <h2 className="mt-6 max-w-3xl text-balance text-[1.9rem] leading-[1.3] sm:text-[2.75rem]">
          {title}
        </h2>
      )}
      {lead && (
        <p className="mt-6 max-w-xl text-pretty border-l-2 border-primary/50 pl-6 text-[1.0625rem] leading-[1.8] text-muted-foreground">
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
        "plate rounded-md p-6 transition-all duration-500 sm:p-8",
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
