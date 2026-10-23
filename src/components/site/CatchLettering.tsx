import lettering from "@/assets/catch-lettering.png.asset.json";

/** One approved lettering asset shared by every website placement. */
export function CatchLettering({ className = "" }: { className?: string }) {
  return <img src={lettering.url} alt="CATCH" width={1344} height={204} draggable={false} className={`block h-auto shrink-0 select-none ${className}`} />;
}