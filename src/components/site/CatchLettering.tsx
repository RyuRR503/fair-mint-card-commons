import lettering from "@/assets/catch-lettering-final.png";

/** One approved lettering asset shared by every website placement. */
export function CatchLettering({ className = "" }: { className?: string }) {
  return <img src={lettering} alt="CATCH" width={1446} height={210} draggable={false} className={`block h-auto shrink-0 select-none ${className}`} />;
}